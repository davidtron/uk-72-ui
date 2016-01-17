# uk-72-ui
React based SPA for UK72

TODOs

Floods:

* Only fetch the promise if the map is zoomed to a certain level
       
List:   
 
* Import bootstrap using npm
    
* Style the list items 
    * When we click on warning expan for more information and link back to the source data
    
    * change power warning to have warning.detail and warning.text
 
Misc:
* error handling (if you type an address as just 109 mildred avenue (without ,watford)

* Change the URL returned by the API service to be have wildcards - that expect the postcode area and district
  That way the client can inject them in and we can cache whole power company results