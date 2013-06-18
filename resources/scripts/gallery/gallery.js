var editor;


$(document).ready(function() {
    editor = new wysihtml5.Editor("description", { // id of textarea element
        toolbar:      "editor-toolbar", // id of toolbar element
    });
    
    $("#toggleGallerySwitch").click(function (e) {
        e.preventDefault();
        var gallery = $("#gallery");
        var  container = $(".gallery-container");
        if(gallery.hasClass("galleryOpen")){
            console.log("close image gallery picker");
            /*
            container.animate({
                    opacity: 0.25,                
                }, 1500, function() {
                            console.log("Closed Image Gallery picker")
                            gallery.toggleClass("galleryOpen");
                })
            */
        }
        else {
            console.log("open image gallery picker");
            /*
             container.show().animate({                
                opacity: 1,                
                }, 1500 , function() {
                    console.log("Opened Image Gallery picker")
                    gallery.toggleClass("galleryOpen");
                }
            );
            */
        }
        gallery.toggleClass("galleryOpen");
        
    });
    loadImages();
    $("#query-images").click(function (ev) {   
       loadImages()
    });
})

function loadImages(start, max) {
    if(start) {
        // update hidden input name="start"
        $('#imagePickerStart').val(start);
    }
    if(max) {
        $('#imagePickerMax').val(max);
    }

    var searchForm = $(".form-search");
    console.log("prepare query images");
    //  if (!form.checkValidity())
    //  return;
    // contentEditor.deactivate();
    // updateForm();
    // $("input[name='action']", form).val("store");
    var data = searchForm.serialize();
    console.debug("search data: ",data);
    $.ajax({
        type: "POST",
        url: "data/_theme/ImageSelector.html",
        data:data,
        complete: function() {
            $.log("updating gallery completed");
            // contentEditor.activate();
        }
    }).done(function( html ) {
        // console.log("ajax.done html:",html)
        $("#imageSelector").replaceWith(html);
        $("#gallery-selection" ).selectable({ 
            filter: "li", 
            selecting: function( event, ui ) {
                if( $(".ui-selected, .ui-selecting").length > 1){
                    $(ui.selecting).removeClass("ui-selecting");
                }else {
                    console.log("Selected! This: ", this, " Event:  ", event , " ui: ", ui);                                
                    var atomTitle = "<span id='img-title-label' class='label'> Title: </span><span id='img-title'>"+$(ui.selecting).find('.image-title').html()+"</span>";
                    var atomId = "<span id='img-id-label' class='label'> Id: </span><span id='img-id'>"+$(ui.selecting).find('.image-id').html()+"</span>";
                    var atomURL = "<span id='img-url-label' class='label'> URL: </span><span id='img-url'>"+$(ui.selecting).find('.image-url').html()+"</span>";
                    var uiContent = "<p>" + atomTitle + atomId + atomURL + "</p>";
                    $(".img-selected").html(uiContent);                    
                }
            },
            unselecting: function( event, ui ) {
               console.log("Unselected! This: ", this, " Event:  ", event , " ui: ", ui);                                
               $(".img-selected").html("");
            }
        });
        
    });
    
}

/*
 * Clones the template 'image' entry and populates it with data
*/
function addImage(){
    console.log("add image: " + $("#img-id").html() + " to Wiki Entry");
    var liTemplate = $("#li-template").clone()
    
    var imageTitle = $("#img-title").html();
    var imageURL = $("#img-url").html();
    var imageId = Atomic.util.uuid();
    
    liTemplate.attr("id", imageId);    
    liTemplate.find(".thumb").attr("href",imageURL);
    liTemplate.find(".img-polaroid").attr("alt",imageTitle);
    liTemplate.find(".img-polaroid").attr("src",imageURL); 
    
    liTemplate.find(".image-title").html(imageTitle); 
    liTemplate.find(".image-desc").attr("id", imageId + "desc"); 
    
    liTemplate.find(".btn-edit").click(function() {   
       showModal(imageId);
    });    
    liTemplate.find(".btn-remove").click(function() {   
       removeItem(imageId);
    });    
    liTemplate.find(".btn-arrow-up").click(function() {   
       moveUp(imageId);
    });    
    liTemplate.find(".btn-arrow-down").click(function() {   
       moveDown(imageId);
    });    
    
    // append the clonde and setup template into the gallery    
    liTemplate.appendTo("#gallery-items")
}

function moveDown(itemid) {
    var item = $("#gallery-items #" + itemid);
    item.insertAfter(item.next());
    jumpTo(item);
}

function moveUp(itemid) {
    var item = $("#gallery-items #" + itemid);
   item.insertBefore(item.prev());
    jumpTo(item);
}

function removeItem(itemid) {
    var gitem = $("#gallery-items #" + itemid);
    var confirmed = confirm("Do you really want to delete this item?");
    if (confirmed) {
        gitem.slideToggle(500, function() {
           gitem.remove();
        });
    }
}

function showModal(itemid) {
    var dialog = $('#edit-gallery-item-dialog');
    var itemTitle = $('#' + itemid + " h3").text();
    var itemDesc = $('#' + itemid + "desc").html();
    
    dialog.find("input[name=title]").val(itemTitle);
    /*
    var anchorEditor = new Atomic.editor.EditAnchor();
    var editor = new Atomic.editor.Editor(itemid + "desc", "description", "editor-toolbar", sitemap, anchorEditor);
    */
    editor.setValue(itemDesc, true);
    
    $('#edit-gallery-item-dialog .apply-button').unbind('click');
    $('#edit-gallery-item-dialog .apply-button').click(function() {
        $('#' + itemid + "desc").html(editor.getValue());
        $('#' + itemid + " h3").html(dialog.find("input[name=title]").val());
        dialog.modal('hide');
    });
    
    
    dialog.modal('show');
}


function jumpTo(item){
    $('html,body').animate({scrollTop: item.offset().top},'slow');
}