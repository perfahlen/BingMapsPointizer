/// <reference path="./../../Bing-Maps-V8-TypeScript-Definitions/scripts/MicrosoftMaps/Microsoft.Maps.All.d.ts" />

class Helper{

    constructor(
       
    ){
        Microsoft.Maps.Polygon.prototype.getExtent = function(){
            let xMin: number = 100;
            let yMin: number = 190; 
            let xMax: number = -100; 
            let yMax: number = -190;

            this.getLocations().forEach((location: Microsoft.Maps.Location) => {
                if (location.latitude > xMax){
                    xMax = location.latitude;
                }
    
                if (location.latitude < xMin){
                    xMin = location.latitude;
                }
     
                if (location.longitude > yMax){
                    yMax = location.longitude;
                }
    
                if (location.longitude < yMin){
                    yMin = location.longitude;
                }
            }); 
            return [xMin, yMin, xMax, yMax];
        };
    }
}

export {Helper}