function addBlock(div, bookmark) {
    d = document.createElement("div");
    d.classList.add("col-md-6");
    d.classList.add("col-sm-6");

    panel = document.createElement("div");
    panel.classList.add("panel");
    panel.classList.add("panel-default");
    d.appendChild(panel);

    panelheading = document.createElement("div");
    panelheading.classList.add("panelheading");

img = document.createElement("img");
img.src = "http://bytes.com/images/facebook.png";

    link = document.createElement("a");
    link.target = "_blank";
    link.href = bookmark.url;
    link.addEventListener('click', function() {
    	
    	$.get(this, function(res) { alert(res);});

    	return false;
    });
    //link.classList.add("pull-right");
    link.appendChild(img);
    //link.textContent = bookmark.title.substring(0, 60);


    //panelheading.appendChild(link);

    panelheadingtitle = document.createElement("h4");
    //panelheadingtitle.textContent = bookmark.title.substring(0, 60);
    panelheadingtitle.appendChild(link);

    if (bookmark.title.length > 60) {
        link.appendChild(document.createTextNode(bookmark.title.substring(0, 60) + "..."));
        //panelheadingtitle.appendChild(document.createTextNode(bookmark.title.substring(0, 60) + "..."));
    }
    else
    {
    	link.appendChild(document.createTextNode(bookmark.title));
    	//panelheadingtitle.appendChild(document.createTextNode(bookmark.title));
    }

    panelheading.appendChild(panelheadingtitle);

    panel.appendChild(panelheading);

    panelbody = document.createElement("div");
    panelbody.classList.add("panelbody");
    /*

					  <img src="https://lh5.googleusercontent.com/-b0-k99FZlyE/AAAAAAAAAAI/AAAAAAAAAAA/eu7opA4byxI/photo.jpg?sz=70" class="img-circle pull-right"> <a href="#">Guidance and Tools</a>
					  <div class="clearfix"></div>
					  <hr>
					  <p>Migrating from Bootstrap 2.x to 3 is not a simple matter of swapping out the JS and CSS files.
					  Bootstrap 3 is a major overhaul, and there are a lot of changes from Bootstrap 2.x. <a href="http://bootply.com/bootstrap-3-migration-guide">This guidance</a> is intended to help 2.x developers transition to 3.
					  </p>
					  <h5><a href="http://google.com/+bootply">More on Upgrading from +Bootply</a></h5>
*/
    panel.appendChild(panelbody);

    div.appendChild(d);
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
            //console.log(node);

            addBlock(document.getElementById('bookmarks'), node);
        } else {
            node.children.forEach(function (n) {
                renderBookmarks(n);
            });
        }
    } else {
        chrome.bookmarks.getTree(function (nodes) {
            //console.log(nodes[0].title);

            if (nodes.length > 0) {
                nodes[0].children.forEach(function (node) {

                    //console.log(node);

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

document.getElementById("txtSearch").addEventListener("keypress", function(e) {
if(e.keyCode==13)
{
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