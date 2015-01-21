



function loadPage() {

    var years = d3.range(2015,1789,-1)

    selectors = d3.select("#yearSelector").selectAll("option").data(years)

    selectors.exit().remove()
    selectors.enter().append("option").attr("value",function(d) {return d}).text(function(d) {return d})

    
    $("#yearSelector").change(function() {loadYear($("#yearSelector").val())})

    
    var query = {
        "database": "SOTUgeo2",
        "plotType": "barchart",
        "method": "return_json",
        "search_limits": {
            "word":["foobar"]
        },
        "aesthetic": {
            "y":"name",
            "x":"WordsPerMillion"
        }
    }

    d3.select("#bookworm").attr("data-offset-top",d3.select("#bookworm").node().getBoundingClientRect().top-40)

    var bookwormInstance = Bookworm(query)
    bookwormInstance.silent=true
    d3.select("#barchart").attr("width",window.innerWidth*.49).attr("height",window.innerHeight*.83).style("opacity",0).transition().delay(3000).duration(1000).style("opacity",1)




    loadYear = function(year) {
	
	d3.selectAll(".whichyear").text(year)
	d3.selectAll(".whichyear").text(function() {return year>2010 ? "Obama's" : "the " + year})
	

        d3.text("SOTUS/" + year + ".txt",function(text) {
	    text = text.replace("&mdash;", " -- ")

            var paragraphs = text.split("\n").filter(function(d) {return d!="None"})
            var tokenized = paragraphs.map(function(d) {
                return d.split(" ")
            })

            d3.select("#speech").selectAll("p").remove()
            var paragraphs = d3.select("#speech").selectAll("p").data(tokenized)

            paragraphs.enter().append("p").attr("class","speech").each(function(d) {
                var tokens = d3.select(this).selectAll("span").data(d)
                tokens.enter().append("span")
                    .attr("class","wormable word").text(function(d) {return d + " "})
                    .style("opacity",0)

                tokens.transition().delay(function(d) {return Math.random()*3000}).duration(1000).style("opacity",1)

                tokens.on("click", function(d) {
                    setWordTo(d)
                })


            })
                //because I really want bigrams, even though no one will use them:
                d3.select(window).on("mouseup",function() {
                    console.log("mouseup")
                    text = getSelectionText()
                    if (text == "") {return}
                    words = text.split(" ")
                    if(words.length==1) {setWordTo(words[0])}
                    if(words.length==2) {
                        word = words.join(" ")
                        console.log(word)
                        bookwormInstance.query.search_limits.word=[word]

                        //runs it.

                        bookwormInstance(d3.select("#barchart"))
                        words = d3.select("#barchart").selectAll("text.title").data([word])
                        words.enter().append("text").attr("class","title").style("size",20).style("color","red")
                            .attr("x",window.innerWidth/4)
                            .attr("y",30)
                            .style("font-size",24)
                            .style("font-color","red")

                        words
                            .text(word)



                    }
                })


        })
    }
    loadYear(2015)

    setWordTo("fellow Americans")
    //from http://stackoverflow.com/questions/5379120/get-the-highlighted-selected-text

    function setWordTo(d) {

        word = stripPunctuation(d)


        bookwormInstance.query.search_limits.word=[word]

        //runs it.

        bookwormInstance(d3.select("#barchart"))
        words = d3.select("#barchart").selectAll("text.title").data([d])
        words.enter().append("text").attr("class","title").style("size",20).style("color","red")
            .attr("x",window.innerWidth/4)
            .attr("y",30)
            .style("font-size",24)
            .style("font-color","red")

        words
            .text(word)



        //change the color of the words depending on whether they're the word we're looking at now.

        d3.selectAll("span.wormable").style("color",function(e) {
            return e==d ? "red" : "black"
        })
        d3.select(this).style("color","red")
    }

    function getSelectionText() {
        var text = "";
        if (window.getSelection) {
            text = window.getSelection().toString();
        } else if (document.selection && document.selection.type != "Control") {
            text = document.selection.createRange().text;
        }
        return text;
    }


    function stripPunctuation (phrase) {
        a = [",",":",";",".",")","(",'"']

        a.map(function(punctuation) {
            phrase = phrase.replace(punctuation,"")
        })

        return phrase
    }
}

loadPage()
