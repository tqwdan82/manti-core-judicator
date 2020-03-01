const convertRowToObj = function(id, data){
    let returnObj = {};
    if(Array.isArray(data)){
        data.forEach(function(dataItem){

            let dataObj = {}
            let dataObjId = "";
            Object.keys(dataItem).forEach(function(dataItemKey){
                if(dataItemKey === id){

                    dataObjId = dataItem[dataItemKey];

                }else{
                    dataObj[dataItemKey] = dataItem[dataItemKey];
                }
            });
            
            returnObj[dataObjId] = dataObj;
        });
    }
    return returnObj;
};

const findByProp = function(dataArray, propName, propVal){
    let returnObj = {};
    let iKeys = Object.keys(dataArray);
    
    for(let i = 0; i < iKeys.length; i++){
        let iKey = iKeys[i];
        let data = dataArray[iKey];
        if(data[propName] === propVal){
            returnObj[iKey] = data;
        }
    }
    return returnObj;
}

const findById = function(dataArray, propVal){
    let returnObj = {};
    let iKeys = Object.keys(dataArray);
    for(let i = 0; i < iKeys.length; i++){
        let iKey = iKeys[i];
        let data = dataArray[iKey];
        if(iKey === propVal){
            returnObj[iKey] = data;
        }
    }
    return returnObj;
}

module.exports = {
    convertRowToObj,
    findByProp,
    findById
};