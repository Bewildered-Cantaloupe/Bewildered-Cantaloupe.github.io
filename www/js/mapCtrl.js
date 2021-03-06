//Map controller

angular.module('offTheTruck.mapCtrl', [])

.controller('mapCtrl', ['$scope', '$firebaseObject', function($scope, $firebaseObject){
  var ref = new Firebase("https://off-the-truck.firebaseio.com/Trucks");
  var myLatlng = new google.maps.LatLng(37.3000, -120.4833);
  var markerStorage = {};
  var markerImg = './img/truckMarker40x27.png';
   
  var mapOptions = {
      center: myLatlng,
      zoom: 16,
      mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  var map = new google.maps.Map(document.getElementById("map-container"), mapOptions);

  navigator.geolocation.getCurrentPosition(function(pos) {
      map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
      var myLocation = new google.maps.Marker({
          position: new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude),
          map: map,
          animation: google.maps.Animation.DROP,
          title: "My Location"
      });
  });

  ref.once('value', function(snapshot){
    var data = snapshot.val();
    for(var key in data){
      if(data[key].isServing){
        var truckMarker = new google.maps.Marker({
          position: new google.maps.LatLng(data[key].lat, data[key].long),
          map: map,
          animation: google.maps.Animation.DROP,
          title: data[key].truckname,
          icon: markerImg
        });
        truckInfo(truckMarker, data[key].truckname);
        markerStorage[data[key].truckname] = truckMarker;
      }
    }
  });

  ref.on('child_changed', function(changedObj){
    var data = changedObj.val();
    if(data.isServing){
      if(markerStorage[data.truckname]){
        var position = new google.maps.LatLng(data.lat, data.long);
        markerStorage[data.truckname].setPosition(position);
      } else {
        var truckMarker = new google.maps.Marker({
          position: new google.maps.LatLng(data.lat, data.long),
          map: map,
          animation: google.maps.Animation.DROP,
          title: data.truckname,
          icon: markerImg
        });
        markerStorage[data.truckname] = truckMarker;
      }
    } else {
      if(markerStorage[data.truckname]){
        markerStorage[data.truckname].setMap(null);
        delete markerStorage[data.truckname];
      }
    }
  });
  
  $scope.map = map;

  //info windows
  function truckInfo(marker, message){
    var infoWindow = new google.maps.InfoWindow({
      content: message
    });
    google.maps.event.addListener(marker, 'click', function(){
      infoWindow.open(map, marker);
    });
  };

}]);