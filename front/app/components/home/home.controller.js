(function(){
	'use strict';

 	angular.module('app.home').controller('HomeController', HomeController);

	function HomeController($scope, homeService,$rootScope) {

		var emptyTask =  {
			description: '',
			email: '',
			name: ''
		}
		var tempElement = null;
		$scope.adding = false;
		$scope.supervisorAuth = false;
		$scope.authPass = '';
		$scope.forms = {};
		$scope.didYouMean = null;
		$scope.task = {...emptyTask}
		$scope.loading={ all: true, modal: false, pending: false }
		$scope.pendingTasks = [];
		$scope.completedTasks= [];

		$scope.changeModal = param => {
			$scope.adding = param;
			$rootScope.bodylayout = '';
			if (param)
				$rootScope.bodylayout = 'modal-open';
		}

		$scope.changeModalAuth = param => {
			$scope.supervisorAuth = param;
			$rootScope.bodylayout = '';
	        $scope.authPass = '';
	        $scope.forms.authForm.$setPristine();
			if (param)
				$rootScope.bodylayout = 'modal-open'
		}

		$scope.getIdleData = () => {
			$scope.loading.pending = true;
			homeService
			.getDogsFacts(3)
            .then(data => {
            	data.map( (task, index) => {
        			homeService
					.saveTask({
            			description: task.text,
            			name: 'Eu',
            			email: 'eu@me.com'
            		})
					.then(data => {
	            		$scope.pendingTasks.push(data);
						$scope.loading.pending = false;
	            	})
            	})
            });
		}

		$scope.handleClick = () => {
			$scope.loading.modal = true;
			homeService
        	.saveTask($scope.task)
            .then(data => {
            	if (data.status === 'pending')
            		$scope.pendingTasks.push(data);
            	else
            		$scope.completedTasks.push(data);
            	
            	$scope.task = {...emptyTask};
            	$scope.adding = false;
				$scope.loading.modal = false;
            }).catch(err => {
            	if (err.status === 400){
					$scope.loading.modal = false;
            		$scope.forms.addTaskForm.email.$setValidity('size', false);
            		$scope.didYouMean = err.data.data.did_you_mean;
            	}
            });
		}

		$scope.handleClickAuth = () => {
			let { item, status, index} = tempElement;
			item.supervisorAuth = CryptoJS.AES.encrypt($scope.authPass, 'CODECHALLENGE').toString();
			updateTask(item, status, index, () => {
				$scope.supervisorAuth = false;
				$scope.authPass = '';
	        	$scope.forms.authForm.$setPristine();
			});
		}

		const updateTask = (item, status, index, onEnd = () => null) => {
			homeService
        	.updateTask({...item, status})
            .then( data => {
            	if (data.status === 'pending'){
            		$scope.pendingTasks.splice(index, 0, data);
            		$scope.completedTasks.splice(
            			$scope.completedTasks.findIndex(e => e.id == item.id)
            		, 1);
            	} else {
            		$scope.completedTasks.splice(index, 0, data);
            		$scope.pendingTasks.splice(
            			$scope.pendingTasks.findIndex(e => e.id == item.id)
            		, 1);
            	}
            	tempElement = null;
            	onEnd();
            }).catch(err => {
            	if (err.status === 401){
            		alert("Senha incorreta");
            		$scope.forms.authForms.authPass.$setValidity('size', false)
            	}
            	if (err.status === 400){
            		$scope.forms.addTaskForm.email.$setValidity('size', false);
            		$scope.didYouMean = err.data.did_you_mean;
            	}
            });
		}

		$scope.changeStatus = (index, item, external, type, status) => {
			if ((item.block_pending == 2 && status == 'pending') || status == item.status)
				return false;

			if (status == 'pending') {
				tempElement = { item, status, index};
				$scope.supervisorAuth = true;
				return false;
			}
			
			updateTask(item, status, index);
	        return false;
		}

	    const getTasks = () => {
	    	$scope.loading.all = true
	        homeService
        	.getTasks()
            .then(function(data) {
            	let pending = [], complete = [];
               	data.map(task => {
               		if (task.status == 'pending'){
               			return pending.push(task);
               		}
               		complete.push(task)
               	})
               	$scope.pendingTasks = [...pending];
               	$scope.completedTasks = [...complete];
               	$scope.loading.all = false;
               	
            });
	    }

	    getTasks();
	}

})();