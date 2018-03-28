var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define("credentials", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Credentials {
        static get BMCredentials() {
            return "";
        }
    }
    exports.Credentials = Credentials;
});
define("helper", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Helper {
        constructor() {
            Microsoft.Maps.Polygon.prototype.getExtent = function () {
                let xMin = 100;
                let yMin = 190;
                let xMax = -100;
                let yMax = -190;
                this.getLocations().forEach((location) => {
                    if (location.latitude > xMax) {
                        xMax = location.latitude;
                    }
                    if (location.latitude < xMin) {
                        xMin = location.latitude;
                    }
                    if (location.longitude > yMax) {
                        yMax = location.longitude;
                    }
                    if (location.longitude < yMin) {
                        yMin = location.longitude;
                    }
                });
                return [xMin, yMin, xMax, yMax];
            };
        }
    }
    exports.Helper = Helper;
});
define("map", ["require", "exports", "credentials"], function (require, exports, Credentials_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = new function Map() {
        let map = new Microsoft.Maps.Map(document.getElementById('myMap'), {
            credentials: Credentials_1.Credentials.BMCredentials,
            center: new Microsoft.Maps.Location(51.50853000, -0.1257400),
            zoom: 11
        });
        let loadGeoJson = () => __awaiter(this, void 0, void 0, function* () {
            return fetch("soccer.geojson").then((r) => {
                return r.json();
            }).then((json) => {
                return Microsoft.Maps.GeoJson.read(json);
            });
        });
        let plotPolygons = (polygons) => {
            let polygonLayer = new Microsoft.Maps.Layer("polygon-layer");
            polygons.forEach(p => {
                let polygon = p;
                console.log(polygon.metadata["@id"]);
                polygonLayer.add(polygon);
            });
            map.layers.insert(polygonLayer);
        };
        let makePins = () => {
            let circleLayer = map.layers[1];
            let pinLayer = new Microsoft.Maps.Layer("pin-layer");
            circleLayer.getPrimitives().forEach(p => {
                let geom = p["geometry"];
                let pin = new Microsoft.Maps.Pushpin(geom.boundingBox.center);
                let attributes = {
                    geometry: Microsoft.Maps.GeoJson.write(p),
                    id: p.metadata["@id"],
                    visible: false
                };
                pin.metadata = attributes;
                pinLayer.add(pin);
            });
            map.layers.insert(pinLayer);
            circleLayer.setVisible(false);
        };
        let clusterPins = () => {
            let pinLayer = map.layers[2];
            let pins = pinLayer.getPrimitives();
            let clusterLayer = new Microsoft.Maps.ClusterLayer(pins);
            map.layers.insert(clusterLayer);
            pinLayer.setVisible(false);
            Microsoft.Maps.Events.addHandler(clusterLayer, 'click', (evt) => {
                if (!evt.target.metadata.visible) {
                    evt.target.metadata.visible = true;
                    let feature = Microsoft.Maps.GeoJson.read(evt.target.metadata.geometry);
                    feature.metadata = evt.target.metadata;
                    plotLayer.add(feature);
                }
                else if (evt.target.metadata.visible) {
                    evt.target.metadata.visible = false;
                    let id = evt.target.metadata.id;
                    let primitives = plotLayer.getPrimitives();
                    let idx = primitives.findIndex(p => p.metadata.id === id);
                    plotLayer.removeAt(idx);
                }
            });
        };
        let plotLayer;
        Microsoft.Maps.loadModule(["Microsoft.Maps.Clustering", "Microsoft.Maps.GeoJson", "Microsoft.Maps.SpatialMath"], function () {
            plotLayer = new Microsoft.Maps.Layer();
            map.layers.insert(plotLayer);
            let polygons = loadGeoJson();
            polygons.then(p => {
                plotPolygons(p);
                let i = 0;
                let timeoutId = setInterval(() => {
                    i === 0 ? makePins() : i === 1 ? clusterPins() : clearInterval(timeoutId);
                    i += 1;
                }, 3000);
            });
        });
    }();
});
//# sourceMappingURL=app.js.map