/// <reference path="./../../Bing-Maps-V8-TypeScript-Definitions/scripts/MicrosoftMaps/Microsoft.Maps.All.d.ts" />
import { Credentials } from './Credentials';
import { Helper } from './helper';


export default new function Map(): void {

    let map = new Microsoft.Maps.Map(document.getElementById('myMap'), {
        credentials: Credentials.BMCredentials,
        center: new Microsoft.Maps.Location(51.50853000, -0.1257400),
        zoom: 11
    });

    let loadGeoJson = async (): Promise<Microsoft.Maps.IPrimitive[]> => {
        return fetch("soccer.geojson").then((r) => {
            return r.json();
        }).then((json) => {
            return <Microsoft.Maps.IPrimitive[]>Microsoft.Maps.GeoJson.read(json);
        });
    }

    let plotPolygons = (polygons: Microsoft.Maps.IPrimitive[]): void => {

        let polygonLayer = new Microsoft.Maps.Layer("polygon-layer");
        polygons.forEach(p => {
            let polygon = <Microsoft.Maps.Polygon>p;
            console.log(polygon.metadata["@id"]);
            polygonLayer.add(polygon);
        });

        map.layers.insert(polygonLayer);
    }

    let makePins = () => {
        let circleLayer = <Microsoft.Maps.Layer>map.layers[1];
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
    }


    let clusterPins = () => {
        let pinLayer = <Microsoft.Maps.Layer>map.layers[2];
        let pins = <Microsoft.Maps.Pushpin[]>pinLayer.getPrimitives();
        let clusterLayer = new Microsoft.Maps.ClusterLayer(pins);
        map.layers.insert(clusterLayer);
        pinLayer.setVisible(false);
        Microsoft.Maps.Events.addHandler(clusterLayer, 'click', (evt) => {
            if (!evt.target.metadata.visible) {
                evt.target.metadata.visible = true;
                let feature = <Microsoft.Maps.Polygon>Microsoft.Maps.GeoJson.read(evt.target.metadata.geometry);
                feature.metadata = evt.target.metadata;
                plotLayer.add(feature);
            } else if (evt.target.metadata.visible) {
                evt.target.metadata.visible = false;

                let id = evt.target.metadata.id;
                let primitives = plotLayer.getPrimitives();
                let idx = primitives.findIndex(p => p.metadata.id === id); // primitives.map( p => p.metadata.id).indexOf(id);
                plotLayer.removeAt(idx);
            }
        });
    }

    let plotLayer: Microsoft.Maps.Layer;

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