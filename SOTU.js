//Changing this variable is enough to reset the bookworm for a different dataset.

var custom = {"index":"name__id","label":"name","starting_index":[12,13],"wordUnit":"unigram"}
//var custom = {"index":"journal__id","label":"journal","starting_index":[12,13],"wordUnit":"topic_label"}


var json = {
    "database":"SOTU",
    "plotType":"worddiv",
    "method":"return_json"
    ,"search_limits":{
    },
    "compare_limits":{
    },
    "aesthetic":{"size":"Dunning","label":custom.wordUnit},
}

json.search_limits[custom.index]=[custom.starting_index[0]]
json.compare_limits[custom.index]=[custom.starting_index[1]]


var dbookworm = Bookworm(json)

dbookworm(d3.select("#comparisons"))

//The new query is a thawed frozen version of the old one.
var a = Bookworm(JSON.parse(JSON.stringify(dbookworm.query)))
a.query.search_limits[custom.index]=undefined
a.query.compare_limits[custom.index]=undefined

a.query['counttype'] = "SumWords"
a.query.aesthetic={"size":"SumWords","key":custom.index,"label":custom.label}
a.alignAesthetic()

a.updateData(callback = function() {

    var options = a.data.sort(function(a,b) {return b.SumWords-a.SumWords})

    var author__idSelector = d3.select("#selectors")
        .selectAll("div.authorChooser")
        .data(["search_limits","compare_limits"])

    author__idSelector.enter()
        .append("div")
        .attr("class","authorChooser dropdown col-md-6 col-xs-6 starter-template")

    var button = author__idSelector
        .append("button")
        .attr("class","btn btn-default dropdown-toggle")
        .attr("type","button")
        .attr("id",function(d) {return "dd-" + d})
        .attr("data-toggle","dropdown")
        .text(function(d) {
            return d=="search_limits" ?
                options.filter(function(d) {return d[custom.index] == custom.starting_index[0]})[0][custom.label] :
            options.filter(function(d) {return d[custom.index] == custom.starting_index[1]})[0][custom.label]
        })

    button.append("span").attr("class","caret")

    var menu = author__idSelector
        .append("ul")
        .attr("class","dropdown-menu col-md-12 starter-template")
        .attr("role","menu")
        .attr("aria-labelledby",function(d) {return "dd-" + d})

    var selectors = menu.selectAll("li.presentation").data(options)

    selectors.enter().append("li")
        .attr("class","bookworm-selection")
        .attr("role","presentation").append("span")
        .attr("tabindex","-1").attr("role","menuitem")
        .text(function(d) {return d[custom.label]})

    selectors.on("click",function(d) {
        var context = this.parentNode.__data__
        dbookworm.query[context][custom.index][0] = d[custom.index]
        button.filter(function(d) {return d==context}).text(d[custom.label])

        d3.select("#comparisons").selectAll(".textgroup").remove()
        dbookworm(d3.select("#comparisons"))
    })


})

function setCallback() {
    console.log('clearing')
    d3.selectAll(".textgroup").on("hover",function() {}).on("focus","")
    d3.select("#comparisons").selectAll(".textgroup").on("mouseover",function(){})
        .selectAll("span")
        .on("click",function(d) {
            addBarchart(d[custom.wordUnit])
        })
}


setCallback()

function removeUppercase() {
    dbookworm.data = dbookworm.data.filter(function(d) {return d[custom.wordUnit].match(/^[a-z]/)})
    dbookworm(d3.select("#comparisons"))
    d3.selectAll("span").filter(function(d) {if (d==undefined) {return};if (d[custom.wordUnit]==undefined) {return}; console.log(d); return d[custom.wordUnit].match(/^([^a-z]|(.$))/)}).remove()
}


var barchartWorm = Bookworm(JSON.parse(JSON.stringify(dbookworm.query)))

barchartWorm.query.search_limits[custom.index]={"$lte":100}
barchartWorm.query.compare_limits[custom.index]=undefined
barchartWorm.query.aesthetic = {'x':"WordsPerMillion","y":custom.label}
barchartWorm.query.plotType = "barchart"

function addBarchart(word) {

    fieldName = custom.wordUnit == "unigram" ? "word" : custom.wordUnit

    barchartWorm.query.search_limits[fieldName] = [word]
    barchartWorm.query.search_limits[fieldName] = [word]

    d3.selectAll(".textgroup").selectAll("span").transition().duration(2000).style('color',function(d) {console.log([d[custom.wordUnit],word]); return d[custom.wordUnit]==word ? "red" : ""})

    svg = d3.select("body").selectAll("svg").data([1]);
    //Create SVG if not exists
    svg.enter().append("svg").attr("height",window.innerWidth).attr("class","col-md-4 col-xs-12").attr("height",700).attr("width",function() {return window.innerWidth*.33})


    barchartWorm(svg,callback=switchRectHighlighting)


}

setInterval(setCallback,1000)

function switchRectHighlighting () {
    highlitClasses = [];
    d3.selectAll("button.dropdown-toggle").each(function(d) {highlitClasses=highlitClasses.concat(d3.select(this).text())});
	
    svg.selectAll("rect").style("opacity",function(d) {
	return highlitClasses.indexOf(d[custom.label])>-1 ?
            .9 : .33
    })
    
}
