# uk-72-ui
React based SPA for UK72


TODOs

* Retrieve flood warnings and cache
* Retrieve power outages for postcode
* Decide how to display polygons. 
    Should we just check if the currentPosition is within a warning region and display, 
    or do we want to display all the polys we have for the UK (probably slow)

* Design common warning API for the list
* Layout of warnings
    When we click on warning expan for more information and link back to the source data
    
* When clicking on a warning we use the center of the bounding box, but also need to set zoom to show whole area

* error handling (if you type an address as just 109 mildred avenue (without ,watford)


* Might be worth considering just passing the array we push warnings into around, that way we can do a lot of parallel loading?
