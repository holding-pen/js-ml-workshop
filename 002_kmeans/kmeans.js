
/*What is to be tested and test library*/
var KNN = require('./kmeans');
var expect = require('chai').expect;

/*Data libraries
  The first one produces random data with arbitrary dimensionality
  The other loads the MNIST digits, which have a dimensionality of 788.
*/
var randomPoints = require('../lib/rand');
var mnist = require('../lib/mnist_reader');


function KMeans(options){
	if (options == undefined){options = {};}
	this.minClusterMove = options.minClusterMove || 0.0001;
	this.clusterAttempts = 10;
	this.points = [];
}

KMeans.prototype.train = function(vectors){
	this.points = this.points.concat(vectors);
}

KMeans.prototype._distance = function(one,two){
	return Math.sqrt(one.reduce(function(old, _, index){return old + Math.pow( one[index] - two[index], 2) }, 0));
}

KMeans.prototype.clusters = function(clusterNum){
	var self = this;
	return self.bestOf ( self.manyClusters ( self.clusterAttempts, clusterNum), function(cluster){
		return -self.points.reduce(function(score, vector){
			return self.reduce(function(smallestDistanceSoFar, aVector){
				return Math.min(smallestDistanceSoFar, self._distance(aVector, vector));
			}, 10000000)
		}, 0 ) / self.points.length;
	});
}
/*



KMeans.prototype._averageLocation = function(vectors){
	return vectors[0].map(function(_, index){
		return vectors.reduce(function(sum, val){
			return sum + val[index];
		}, 0) / vectors.length;
	});
}

KMeans.prototype._haveShifted = function(centroids, oldCentroids){
	var self = this;
	return !centroids.some(function(centroid, index){ return self._distance(centroid, oldCentroids[index]) <= self.minClusterMove; });
}

KMeans.prototype._averageDistance = function(centroids, belongs){
	var self = this;
	var totalNum = centroids.reduce(function(old,_,index){return old+belongs[index].length},0);
	return centroids.reduce(function(sum, centroid, index){
		return sum + belongs[index].reduce(function(inner_sum, b, inner_index){
			return inner_sum + self._distance(centroid,b);
		}, 0);
	}, 0) / totalNum;
}

KMeans.prototype._assignToCentroids = function(centroids, vectors){
	var self = this;
	var belongs = centroids.map(function(){return []});
	for(var x = 0, len = vectors.length; x < len; x++){
		var distances = centroids.map(function(n){ return self._distance(vectors[x], n)});
		var leastIndex = distances.reduce(function(old, cur, index, arr){ return (old.val < cur) ? old : {val: cur, index: index}; }, {val: 10000, index: 0}).index;
		belongs[leastIndex].push(vectors[x])
	}
	return belongs;
}

KMeans.prototype._centroidsOfPoints = function(belongs){
	var self = this;
	return belongs.map(function(_, x){
		return (belongs[x].length != 0) ? self._averageLocation(belongs[x]) : self.points[Math.floor(Math.random()*self.points.length)];
	});
}

KMeans.prototype.clusters = function(clusterNum){
	var possibleClusters = this._clusters(clusterNum, this.clusterAttempts);
	return possibleClusters.reduce(function(old, cluster, index){
		return (old.averageDistance < cluster.averageDistance) ? old : cluster;
	}, possibleClusters[0]);
}

KMeans.prototype._clusters = function(clusterNum, numOfClusters){
	var self = this;
	var ret = [];
	for(var i = 0; i < numOfClusters; i++){
		var centroids = this.points.slice(i*clusterNum,i*clusterNum+clusterNum);
		var looping = true;
		while(looping){
			var oldCentroids = centroids.slice();
			var belongs = self._assignToCentroids(centroids, this.points);
			centroids = self._centroidsOfPoints(belongs);			
			looping = self._haveShifted(centroids, oldCentroids);
		}
		ret.push( {
			centroids: centroids,
			averageDistance: this._averageDistance(centroids, belongs)
		});
	}
	return ret;
}







KMeans.prototype._standardDeviation = function(arrs){
	var mean = arrs.reduce(function(a,b){return a+b;}, 0) / arrs.length;
	return Math.sqrt(arrs.reduce(function(a,b){
		return a + (mean - b)*(mean - b);
	}, 0) / mean);
};

KMeans.prototype.findClusters = function(maxClusterNum){
	var averageDistAndVariances = [];
	for(var x = 1; x < maxClusterNum; x++){
		averageDistAndVariances.push(this.clusters(x));
	}
	var leaps = [];
	for(var x = 0; x < averageDistAndVariances.length - 1; x++){
		leaps.push(averageDistAndVariances[x].averageDistance - averageDistAndVariances[x+1].averageDistance);
	}
	console.log(leaps)
	var largest = 0;
	var index = 0;
	for(var y = 0; y < leaps.length; y++){
		if (this._standardDeviation(leaps.slice(y,leaps.length)) < this._standardDeviation(leaps)/4){
			index = y;
			break;
		}
	}
	return averageDistAndVariances[index];
}

module.exports = KMeans