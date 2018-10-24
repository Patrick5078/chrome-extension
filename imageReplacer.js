var port = chrome.runtime.connect();
// There is an array with default images in another file

let savedImages = localStorage.savedImages ? JSON.parse(localStorage.savedImages) : {}

// Select the node that will be observed for mutations

let replacedImages = []
var targetNode = document;

// Options for the observer (which mutations to observe)
var config = { attributes: true, childList: true, subtree: true };

// Callback function to execute when mutations are observed
var callback = function(mutationsList, observer) {
    for(var mutation of mutationsList) {
        if (mutation.type == 'childList') {
            if (mutation.addedNodes.length) {   
                let addedNode = mutation.addedNodes[0]
                if (!(typeof addedNode.getElementsByTagName === 'function'))
                    continue

                let images = addedNode.getElementsByTagName('img')
                if (images.length){   
                    for (var image of images){
                            // Exclude things that are already replaced
                            if (image.src.startsWith('data'))
                                continue
                            if (savedImages[extractImageId(image.src)]){
                                image.src = savedImages[extractImageId(image.src)]
                                continue
                            }
                            // Determining profile pictures based on borderRadius was the best i could find for now
                            let imageStyle = getComputedStyle(image)
                            let parentNodeStyle = getComputedStyle(image.parentNode)
                            let grandParentstyle = getComputedStyle(image.parentNode.parentNode)
                            let grandGrandParentStyle = getComputedStyle(image.parentNode.parentNode.parentNode.parentNode)
                            if (parentNodeStyle.borderRadius === '50%' || grandParentstyle.borderRadius === '50%' || imageStyle.borderRadius === "50%" || grandGrandParentStyle.borderRadius === '50%'){
                                let randomlyAssignedImage = defaultImages[getRandomInt(6)]
                                savedImages[extractImageId(image.src)] = randomlyAssignedImage
                                image.src = randomlyAssignedImage
                            }
                    }
                }
            }
        }
    }
};


// Create an observer instance linked to the callback function
var observer = new MutationObserver(callback);

// Start observing the target node for configured mutations
observer.observe(targetNode, config);

setTimeout(function(){
    localStorage.savedImages = JSON.stringify(savedImages)
    console.log('images saved')
}, 5000)

function getBase64Image(img) {
    // Create an empty canvas element
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    // Copy the image contents to the canvas
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    // Get the data-URL formatted image
    // Firefox supports PNG and JPEG. You could check img.src to
    // guess the original format, but be aware the using "image/jpg"
    // will re-encode the image.
    var dataURL = canvas.toDataURL("image/png");

    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

function extractImageId(imageSrc) {
    const firstHalf = imageSrc.split('?')[0];
    const splittedString = firstHalf.split('/')
    return splittedString.pop()
}