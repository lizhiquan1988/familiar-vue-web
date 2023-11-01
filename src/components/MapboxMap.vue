<template>
  <main>
    <div class="text-container">
       <!-- <img alt="logo" src="../assets/img/familiar.png"> -->
      <p>子供位置関連操作</p>
    <div v-if="updatingFlag===0">
          <div class="button" @click="getChildLocationAuto">自動更新</div>
          <div class="text-commend">*3秒毎に最新位置を取得できます。</div>
    </div>
        <div v-if="updatingFlag!==0">
          <div class="button_margin" @click="stopUpdateChildLocation">自動更新中止</div>
          <div v-if="trackChildLocationFlag" class="button_margin" @click="stopTrackChildLocation">追跡中止</div>
          <div v-else class="button_margin" @click="trackChildLocation">追跡再開</div>
    </div>
    </div>

    <!-- <div class="button" @click="getChildRoute">ルート探索</div> -->
    <div class="text-container">
      <div v-if="distanceMeter===0">お子様が隣にいます。</div>
      <div v-else >お子様との距離：{{distanceMeter}}</div>
      <div v-if="updateTime!==0" class="text-commend-update">*{{updateTime}}で取得した位置情報です。</div>
    </div>      
    <div id="map"></div>
  </main>
</template>

<script>
import mapboxgl from "mapbox-gl";
import MapboxLanguage from "@mapbox/mapbox-gl-language";
import FamiliarService from "../services/FamiliarService";
// import {ref} from 'vue'

// サポートしてるかチェック
if (!mapboxgl.supported()) {
    alert("Your browser does not support Mapbox GL");
} else {
    console.log("Your browser supported Mapbox GL");
}

var childMarker;
var loopController;

export default {
    // setup() {
    //     const persionImage = ref()
    //     persionImage.value = require('~@assets/img/persion')
    //     return {
    //         persionImage
    //     }
    // },
  name: "MapboxMap",
  data() {
    // Set initial data, this.createMap() configures event listeners that update data based on user interaction
    return {
      center: [139.7575, 35.6789],
      location: [139.7575, 35.6789],
      zoom: 15,
      nowChildLat: 0,
      nowChildLon: 0,
      distanceMeter: 0,
      updatingFlag: 0,
      updateTime: 0,
      trackChildLocationFlag: false
    };
  },
  mounted() {
    // create the map after the component is mounted
    this.createMap();
    this.addCurrentLocation();
    this.addNavigationControl();
  },
  methods: {
    createMap() {
      // instantiate map.  this method runs once after the vue component is mounted to the dom
      this.map = new mapboxgl.Map({
        accessToken:
          "pk.eyJ1IjoibWFwYm94bGl6aGlxdWFuIiwiYSI6ImNsZWZkejFyZzA0cTIzeHQxMTYzd2hrcjIifQ.GB7FcwHXN4gjp98WboK-1g",
        container: "map",
        style: "mapbox://styles/mapbox/streets-v11",
        minzoom: 5,
        center: this.center, // use initial data as default
        zoom: this.zoom,
        hash: true // sets url's hash to #zoom/lat/lng
      });

        this.map.addControl(new MapboxLanguage({
            defaultLanguage: 'ja'
        }))

      // set mapbox event listeners to update Vue component data
      this.map.on("move", () => {
        // set the vue instance's data.center to the results of the mapbox instance method for getting the center
        this.center = this.map.getCenter();
      });
      this.map.on("zoom", () => {
        // set the vue instance's data.zoom to the results of the mapbox instance method for getting the zoom
        this.zoom = this.map.getZoom();
      });
      this.map.on('load', () => {
        //   this.map.loadImage("http://placekitten.com/50/50", (error, image) => {
        //       if (error) throw error
        //       this.map.addImage('child', image);
        //       this.map.addSource('point', {
        //           'type':'geojson',
        //           'data': {
        //               'type':'FeatureCollection',
        //               'features': [
        //                   {
        //                       'type': 'Feature',
        //                       'geometry': {
        //                           'type': 'Point',
        //                           'coodinates': [139.7575, 35.6789]
        //                       }
        //                   }
        //               ]
        //           }
        //       });
        //       this.map.addLayer({
        //           'id': 'childPoints',
        //           'type': 'symbol',
        //           'source': 'point',
        //           'layout':{
        //               'icon-image': 'child',
        //               'icon-size': 0.25
        //           }
        //       })
        //   });
        //     this.map.addSource('points', {
        //         'type': 'geojson',
        //         'data': {
        //             'type': 'FeatureCollection',
        //             'features': [
        //                 {
        //                     'type': 'Feature',
        //                     'geometry': {
        //                         'type': 'Point',
        //                         'coordinates': [139.7575, 33]
        //                     },
        //                     'properties': {
        //                         'color': '255,0,0'
        //                     }
        //                 },
        //                 {
        //                     'type': 'Feature',
        //                     'geometry': {
        //                         'type': 'Point',
        //                         'coordinates': [139.7575, 33]
        //                     },
        //                     'properties': {
        //                         'color': '255,209,28'
        //                     }
        //                 },
        //                 {
        //                     'type': 'Feature',
        //                     'geometry': {
        //                         'type': 'Point',
        //                         'coordinates': [139.7575, 33]
        //                     },
        //                     'properties': {
        //                         'color': '242,127,32'
        //                     }
        //                 }
        //             ]
        //         }
        //     });
        //     this.map.addLayer({
        //         'id': 'points',
        //         'type': 'symbol',
        //         'source': 'points',
        //         'layout': {
        //             'icon-image': ['concat', 'square-rgb-', ['get', 'color']]
        //         }
        //         });
        });
    },

    //提示信息 封装
    Toast(msg,duration){  
       duration=isNaN(duration)?3000:duration;  
       var m = document.createElement('div');  
       m.innerHTML = msg;  
       m.style.cssText="font-size: .64rem;color: rgb(255, 0, 0);background-color: rgba(255, 255, 0, 0.6);padding: 10px 15px;margin: 0 0 0 -60px;border-radius: 4px;position: fixed; border: 2px solid rgb(255,194,64);   top: 50%;left: 50%;width: 130px;text-align: center;";
       document.body.appendChild(m);   
       setTimeout(function() { 
         var d = 0.5;
         m.style.opacity = '0';  
         setTimeout(function() { document.body.removeChild(m) }, d * 1000);  
       }, duration);  
    },

    addCurrentLocation() {
        let locate = new mapboxgl.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true
            },
            // 誤差範囲の円を出す
            showAccuracyCircle: true, // default: true
            // 向き
            showUserHeading: true, // default: false
            // マーカーを出す
            showUserLocation: true, // default: true
            // トグルボタン
            trackUserLocation: true, // default: false
        })
        this.map.addControl(locate);
        this.map.on("load", () => {
            locate.trigger();
        })
        locate.on('geolocate', (data) => {
          const crd = data.coords;
          this.location=[crd.longitude, crd.latitude];
          this.getLocationFromDB();
          console.log("Your current position is:");
          console.log(`Latitude : ${crd.latitude}`);
          console.log(`Longitude: ${crd.longitude}`);
          console.log(`More or less ${crd.accuracy} meters.`);
        })
    },

    addNavigationControl() {
        let nav = new mapboxgl.NavigationControl({
            visuaiizePitch: true,
        });
        this.map.addControl(nav, "top-right")
    },
    addMarker(lon, lat) {
        // Create a new marker.
        childMarker = new mapboxgl.Marker({
          color:'#FF7F50'
        }).setLngLat([lon, lat]).addTo(this.map);
        console.log('マーカー追加された')
        if(this.trackChildLocationFlag) {
          this.moveToCenter(lon, lat);
        }
        this.getDistance(lon,lat);
    },
    getChildLocationAuto() {
      this.startUpdateOnAndroid();
      loopController = setInterval(this.getLocationFromDB, 3000);
      this.updatingFlag = 1;
      this.trackChildLocationFlag = true
    },
    stopUpdateChildLocation() {
      this.stopUpdateOnAndroid();
      clearInterval(loopController);
      this.updatingFlag = 0;
      this.trackChildLocationFlag = false
    },
    moveToCenter(lon, lat) {
      this.map.flyTo({
        center: [lon, lat],
        zoom: this.zoom
      })
    },
    getDistance(lon, lat) {
      const childLocation = new mapboxgl.LngLat(lon, lat);
      const parentLocation = new mapboxgl.LngLat(this.location[0], this.location[1]);
      this.distanceMeter = this.formatDistance(parentLocation.distanceTo(childLocation));
    },
    stopTrackChildLocation() {
      this.trackChildLocationFlag=false;
    },
    trackChildLocation() {
      this.trackChildLocationFlag=true;
    },
    formatDistance(distance) {
      distance = Math.trunc(distance)
      // this.Toast('距離は'+distance, 3000);
      if(distance ===0) {
        return 0;
      }
      if(distance / 1000 <= 0) {
        return distance+"m";
      } else {
        const distanceKm = Math.floor(distance/1000);
        const distanceM = distance - distanceKm * 1000;
        const distanceKmStr = distanceKm === 0 ? 0 : distanceKm + "Km ";
        const distanceMStr = distanceM === 0 ? 0 : distanceM + "m"
        if(distanceKmStr === 0 && distanceMStr === 0) {
          return 0;
        } else {
          return (distanceKm === 0 ? "" : distanceKm + "Km ") + (distanceM === 0 ? "" : distanceM+"m");
        }
      }
    },
    startUpdateOnAndroid() {
      FamiliarService.sendWebSocket("update").then(response => {
        const rtnValue = response.data
        if(rtnValue === "failed") {
          this.Toast("アプリ側は通信できない状態なので、操作は失敗しました。", 3000)
        }
        console.log(rtnValue)
      })
    },
    stopUpdateOnAndroid() {
      FamiliarService.sendWebSocket("stop_update").then(response => {
          const rtnValue = response.data
        if(rtnValue === "failed") {
          this.Toast("アプリ側は通信できない状態なので、操作は失敗しました。", 3000)
        }
        console.log(rtnValue)
      })
    },

    getLocationFromDB() {
      // DB検索処理 userIdはGobal変数利用予定
      FamiliarService.findByUserId('1001').then(response => {
        var locationInfos = response.data;
        if(locationInfos.size <= 0){
          return
        }
        var locationInfo = locationInfos[0]
        if(this.nowChildLat === location.Latitude && 
          this.nowChildLon === location.longitude) {
            return
        }
        if(childMarker) {
          childMarker.remove();
        }
        this.nowChildLon = locationInfo.longitude;
        this.nowChildLat = locationInfo.latitude;
        this.updateTime = locationInfo.updateTime;
        this.addMarker(this.nowChildLon, this.nowChildLat);
      }).catch(e => {
        console.log(e);
      });
    }
  }
};
</script>

<style scoped>
#map {
  height: 400px;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  border: 1px solid darkgrey;
}

.text-container {
  max-width: 500px;
  display: flex;
  flex-direction: column;
  text-align: left;
  align-items: flex-start;
  border: 1px solid darkgrey;
  border-radius: 10px;
  padding-left: 20px;
  margin: 10px auto; /* center text container */
}
.text-commend {
  max-width: 500px;
  display: flex;
  flex-direction: column;
  text-align: left;
  font-size: 10px;
  color: red;
  align-items: flex-start;
  margin: 0 auto; /* center text container */
}
.text-commend-update {
    font-size: 10px;
    color: red;
}

.button {
    padding-left: 2px;
    padding-right: 2px;
    border-radius: 10px;
    display: inline-block;
    border: 2px solid rgb(255,194,64);
    background: linear-gradient(to bottom, rgb(255,244,92), rgb(240,229,86)); 
}
.button_margin {
    padding-left: 2px;
    padding-right: 2px;
    margin-bottom: 10px;
    border-radius: 10px;
    margin-right: 20px;
    display: inline-block;
    border: 2px solid rgb(255,194,64);
    background: linear-gradient(to bottom, rgb(255,244,92), rgb(240,229,86)); 
}
</style>
