angular.module('app.home').factory('homeService', ['$http', homeService]);

function homeService($http) {

    const getTasks = () =>
        $http.get('/api/tasks')
            .then( res => res.data )

    const saveTask = data =>
        $http.post('/api/task', data)
            .then( res => res.data )

    const updateTask = data =>
        $http.put('/api/task', data)
            .then( res => res.data )

    const getDogsFacts = (quantity) =>
        $http.get(`https://cat-fact.herokuapp.com/facts/random?animal_type=cat&amount=${quantity}`)
            .then( res => res.data ) 

    return {
        getTasks,
        saveTask,
        updateTask,
        getDogsFacts
    }
}