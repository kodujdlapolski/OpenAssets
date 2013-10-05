var openAssets = angular.module('openAssets', [ 'ngResource' ]);

openAssets.config(function($routeProvider) {
	$routeProvider.when('/', {
		controller : function($scope, $location, $routeParams, $http, RandomImageInfo) {
			return OpenAssetsCtrl($scope, $location, $routeParams, $http, RandomImageInfo);
		},
		templateUrl : 'home.html'
	}).when('/asset/:documentId', {
		controller : function($scope, $location, $routeParams, $http, ImageInfoById) {
			return OpenAssetsCtrl($scope, $location, $routeParams, $http, ImageInfoById);
		},		
		templateUrl : 'home.html'
	}).when('/thankyou', {
		controller : ThankYouCtrl,
		templateUrl : 'thankyou.html'
	}).otherwise({
		redirectTo : '/'
	});
});

openAssets.service('RandomImageInfo', function($http) {
	return $http.get('rest/documents/random');
});

openAssets.service('ImageInfoById', function($http, $routeParams) {
	return $http.get('rest/documents/' + $routeParams.documentId);
});

function ThankYouCtrl($scope, $location) {
	$scope.fillAnother = function() {
		$location.path("/");
	};
}

function OpenAssetsCtrl($scope, $location, $routeParams, $http, Service) {

	var currentIndex = 1;

	var selectPage = function(index) {
		$(".document-container").hide();
		$(".page_link").removeClass("active");
		$("#link_page" + index).addClass("active");
		$("#page" + index).show();
		
		// imageZoom:
		$("#page" + index).find('.document-image img').css({'max-width':'100%', 'left':'0px', 'top':'0px'});
		$('#zoom-button').removeClass('btn-primary');

		currentIndex = index;
	}

	bindImageInfo = function(data, status, headers, config) {
		data.images.forEach(function(docimage) {
			if (docimage.id === "page1") {
				docimage.button_class = "active";
			} else {
				docimage.page_class = "hidden-page";
			}
		});
		$scope.docimages = data.images;

		$scope.form_definition = app.form_definition;
		$scope.userinput = {
			'document_id' : data.document_id,
			'ep_object_id' : data.ep_object_id
		};

		$scope.is_last = function() {
			return (currentIndex == $scope.docimages.length);
		}
	}

	retrieveExampleOutput = function() {
		return $http.get('examples/output.json');
	}

	postDocument = function(document) {
		return $http.post('rest/transcriptions/', document);
	}

	documentUpdateSuccesfull = function(data, status, headers, config) {
		console.log("Document updated succesfully");
		$location.path('/thankyou');
	}

	documentUpdateError = function(data, status, headers, config) {
		console.warn("Document not updated - Statuscode: " + status);
		$location.path('/thankyou');
	}

	$scope.saveInput = function($location) {
		postDocument($scope.userinput).success(documentUpdateSuccesfull).error(
				documentUpdateError);
		$scope.userinput = {
			'document_id' : $scope.userinput.document_id,
			'ep_object_id' : $scope.userinput.ep_object_id
		};
	};

	$scope.page_selected = selectPage;
	$scope.is_last = false;
	$scope.next_page = function(event) {
		event.preventDefault();
		selectPage(currentIndex + 1);
	}

	Service.success(bindImageInfo);		

}



imageZoom = {
	drag: false,

	initBtn: function(zoomBtn) {
		zoomBtn.click(function(){
			var img = $('.document-container:visible img');
			
			var left = img.css('left');
			var top = img.css('top');
			left = parseInt(left.substr(0, left.length - 2), 10);
			top = parseInt(top.substr(0, top.length - 2), 10)
			
			var w1 = img.width();
			var h1 = img.height();
			if (zoomBtn.hasClass('btn-primary')) {
				img.css('max-width', '100%');
				zoomBtn.removeClass('btn-primary');
			} else {
				img.css('max-width', '2000px');
				zoomBtn.addClass('btn-primary');
			}
			var w2 = img.width();
			var h2 = img.height();
			
			img.css('left', ''+(left - (w2 - w1)/2)+'px');
			img.css('top', ''+(top - (h2 - h1)/2)+'px');
		});
	},
	
	initImg: function(img) {
		img.on('dragstart', function(event) { event.preventDefault(); });
		
		img.mousedown(function(event){
			var top = img.css('top');
			var left = img.css('left');
			imageZoom.drag = {
				startX : event.pageX - parseInt(left.substr(0, left.length - 2), 10),
				startY : event.pageY - parseInt(top.substr(0, top.length - 2), 10)
			};
		});
		img.mouseup(function(event){
			imageZoom.drag = false;
		});
		
		img.parent().mousemove(function(event){
			if (imageZoom.drag) {
				img.css('left', ''+(event.pageX - imageZoom.drag.startX)+'px');
				img.css('top', ''+(event.pageY - imageZoom.drag.startY)+'px');
			}
		});
	}
};

openAssets.directive('zoomInit', function(){ return function(scope, element, attr) {
	imageZoom.initImg(element.children('img'));
};});

openAssets.directive('zoomBtnInit', function(){ return function(scope, element, attr) {
	imageZoom.initBtn(element);
};});

