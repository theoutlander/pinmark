var carouselTemplate = " \x3Cdiv id=\"carousel-example-generic\" class=\"carousel slide\" data-ride=\"carousel\"\x3E\n \x3Cdiv class=\"carousel-inner\"\x3E \n \x3C\x2Fdiv\x3E\n\n \x3Ca class=\"left carousel-control\" href=\"#carousel-example-generic\" data-slide=\"prev\"\x3E\n \x3Cspan class=\"glyphicon glyphicon-chevron-left\"\x3E\x3C\x2Fspan\x3E\n \x3C\x2Fa\x3E\n \x3Ca class=\"right carousel-control\" href=\"#carousel-example-generic\" data-slide=\"next\"\x3E\n \x3Cspan class=\"glyphicon glyphicon-chevron-right\"\x3E\x3C\x2Fspan\x3E\n \x3C\x2Fa\x3E\n \x3C\x2Fdiv\x3E";

function addBlock(div, bookmark) {
    d = document.createElement("div");
    d.classList.add("col-md-4");
    d.classList.add("col-sm-4");

    panel = document.createElement("div");
    panel.classList.add("panel");
    panel.classList.add("panel-default");
    d.appendChild(panel);

    panelheading = document.createElement("div");
    panelheading.classList.add("panel-heading");

    /*img = document.createElement("img");
    img.classList.add("img-rounded");
    img.classList.add("img-thumbnail");
    */
    
    link = document.createElement("a");
    link.target = "_blank";
    link.href = bookmark.url;
    link.classList.add("pull-right");

    panelheading.appendChild(link);

    panelheadingtitle = document.createElement("h4");

    if (bookmark.title.length > 60) {
        link.appendChild(document.createTextNode(bookmark.title.substring(0, 60) + "..."));
    } else {
        link.appendChild(document.createTextNode(bookmark.title));
    }

    panelheading.appendChild(panelheadingtitle);

    panel.appendChild(panelheading);

    panelbody = document.createElement("div");
    panelbody.classList.add("panel-body");
    panel.appendChild(panelbody);

    fetchContent(bookmark, panelheadingtitle, panelbody, function(hasImages) {
        
        if (hasImages && div && div.children && div.children.length>0) {
            div.insertBefore(d, div.children[0]);
        } else {
            div.appendChild(d);
        }   
    });
}

function fetchFromCache(bookmark, callback) {
    var element = (window.localStorage[bookmark.url]) ? JSON.parse(window.localStorage[bookmark.url]) : null;

    if (!!!element) {
        element = {};

        try {

            if (bookmark.url.indexOf("http") != 0) {
                element.title = bookmark.url;
                element.images = [];
            } else {

                // get image
                $.get(bookmark.url, function(result) {

                    var e = document.createElement('div');
                    e.innerHTML = result;
                    element.title = "";

                    var title = e.getElementsByTagName('title');
                    if (title && title.length != null && title.length > 0) {
                        element.title = title[0].textContent;
                    }

                    var snippet = e.getElementsByTagName('p');
                    element.snippet = "";

                    if (snippet && snippet.length != null && snippet.length > 0) {
                        try {
                            element.snippet = snippet[0].textContent.substring(0, snippet[0].textContent.length > 100 ? 100 : snippet[0].textContent.length);
                        } catch (e) {
                            console.log(e);
                        } 
                    }

                    var images = e.getElementsByTagName('img');
                    element.images = [];

                    if (images && images.length != null) {
                        for (var i = 0; i < images.length; i++) {
                            if (images[i].src.indexOf("http") == 0) {
                                element.images.push(images[i].src);
                            }
                        }
                    }

                    window.localStorage[bookmark.url] = JSON.stringify(element);

                    callback(element);
                }).fail(function (e) {
                    element.title = "";
                    element.images = [];
                    
                    window.localStorage[bookmark.url] = JSON.stringify(element);
                    callback(element);
                });
            }
        }
        catch (e) {
            console.log(e);
        }
    }
    else {
        callback(element);
    }
}

var carouselId = 0;

function fetchContent(bookmark, panelheadingtitle, panelbody, callback) {
    fetchFromCache(bookmark, function (element) {

        panelheadingtitle.appendChild(document.createTextNode(element.title));

        try {
            var p = document.createElement("p");
            p.textContent = element.snippet;
            panelbody.appendChild(p);

        } catch(e) {
            console.log(e);
        }

        if (element.images && element.images.length>0) {
            var div = document.createElement("div");
            div.innerHTML = carouselTemplate;

            var carouselDiv = div.getElementsByClassName("carousel")[0];
            carouselDiv.id = "carousel-" + carouselId;
            
            var right = div.getElementsByClassName("right")[0];
            right.href = "#carousel-" + carouselId;

            var left = div.getElementsByClassName("left")[0];
            left.href = "#carousel-" + carouselId;

            carouselId++;

            var imageDiv = div.getElementsByClassName("carousel-inner")[0];

            for (var i = 0; i < element.images.length; i++) {
                if (element.images[i].indexOf("http") == 0) {
                    var image = document.createElement("img");
                    image.classList.add("item");

                    removeEmptyImage(image, imageDiv);

                    image.src = element.images[i];
                    
                    if (imageDiv.children.length == 0) {
                        image.classList.add("active");
                    }
                    
                    imageDiv.appendChild(image);
                }
            }
            
            if (imageDiv.children.length == 1) {
                carouselDiv.removeChild(left);
                carouselDiv.removeChild(right);

                carouselDiv.height = imageDiv.children[0].naturalHeight;
                carouselDiv.width = imageDiv.children[0].naturalWidth;
            }

            panelbody.appendChild(div);
        }

        callback(imageDiv && imageDiv.children.length > 0);
    });
};

function removeEmptyImage(image, div) {
    image.addEventListener("error", function (e) {
        if (e.srcElement.naturalWidth == 0 || e.srcElement.naturalHeight == 0) {
            div.removeChild(image);
        }
    });
}

function clearResults() {
    var c = document.getElementById("bookmarks");

    while (c.children.length > 0) {
        c.removeChild(c.children[0]);
    }
}

function searchBookmarks(query) {
    clearResults();

    if (query == "") {
        renderBookmarks();
    } else {
        chrome.bookmarks.search(query, function (items) {
            items.forEach(function (item) {
                renderBookmarks(item);
            });
        });
    }
}

function renderBookmarks(node) {
    if (node) {
        if (node.url) {

            addBlock(document.getElementById('bookmarks'), node);
        } else {
            node.children.forEach(function (n) {
                renderBookmarks(n);
            });
        }
    } else {
        chrome.bookmarks.getTree(function (nodes) {

            if (nodes.length > 0) {
                nodes[0].children.forEach(function (node) {

                    if (node.children) {
                        node.children.forEach(function (n) {
                            renderBookmarks(n);
                        });
                    }
                });
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', function () {

    document.getElementById("txtSearch").addEventListener("keypress", function (e) {
        if (e.keyCode == 13) {
            document.getElementById("btnSearch").click();
        }
    });


    $('#btnSearch').click(function () {
        searchBookmarks(document.getElementById('txtSearch').value);
    });

    /* toggle layout */
    $('#btnToggle').click(function () {
        if ($(this).hasClass('on')) {
            $('#main .col-md-6').addClass('col-md-4').removeClass('col-md-6');
            $(this).removeClass('on');
        } else {
            $('#main .col-md-4').addClass('col-md-6').removeClass('col-md-4');
            $(this).addClass('on');
        }
    });


    renderBookmarks();
});