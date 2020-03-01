const Table_RuleChainInputModel = [
    {
        "IMID": "im1",
        "Type": "CM",
        "DataModName": null,
        "DataModDef": {
            "attr1": "value",
            "attr2": "value"
        }
    },
    {
        "IMID": "person",
        "Type": "CM",
        "DataModName": "Person",
        "DataModDef": {
            "name": "value",
            "age": "value",
            "gender": "value",
            "pet":{
                "type": "value",
                "gender": "value"
            }
        }
    },
    {
        "IMID": "personpets",
        "Type": "CM",
        "DataModName": "Person",
        "DataModDef": {
            "name": "value",
            "age": "value",
            "gender": "value",
            "pet":[{
                "type": "value",
                "gender": "value"
            }]
        }
    }
];
const Table_RuleChain = [
    {
        "RCID": "rc1",
        "RCName": "Adult",
        "IMID": "person",
        "Type": "root"
    },
    {
        "RCID": "rc2",
        "RCName": "Has dog",
        "IMID": "person",
        "Type": "chain"
    },
    {
        "RCID": "rc3",
        "RCName": "Has at least a dog",
        "IMID": "personpets",
        "Type": "chain"
    },
    {
        "RCID": "rc4",
        "RCName": "Old man",
        "IMID": "personpets",
        "Type": "root"
    }

];
const Table_RuleChainNode = [
    {
        "RCNID": "rcn1",
        "RCID":"rc1",
        "Type": "Filter",
        "Attribute": "age",
        "isRootNode": true
    },
    {
        "RCNID": "rcn2",
        "RCID": "rc1",
        "Type": "Chain",
        "Attribute": "rc2",
        "isRootNode": false
    },
    {
        "RCNID": "rcn3",
        "RCID": "rc2",
        "Type": "Filter",
        "Attribute": "pet.type",
        "isRootNode": true
    },
    {
        "RCNID": "rcn4",
        "RCID": "rc2",
        "Type": "Action",
        "Attribute": "function(){ console.log('ok so this bloody adult has a dog, AND...?');}",
        "isRootNode": false
    },
    {
        "RCNID": "rcn5",
        "RCID":"rc4",
        "Type": "Filter",
        "Attribute": "age",
        "isRootNode": true
    },
    {
        "RCNID": "rcn6",
        "RCID": "rc4",
        "Type": "Chain",
        "Attribute": "rc3",
        "isRootNode": false
    },
    {
        "RCNID": "rcn7",
        "RCID": "rc3",
        "Type": "Count",
        "Attribute": {
            "property":"pet[]",
            "condition":{
                "property":"type",
                "op" : "===",
                "value": "'dog'"
            }
        },
        "isRootNode": true
    },
    {
        "RCNID": "rcn8",
        "RCID": "rc3",
        "Type": "Action",
        "Attribute": "function(){ console.log('ok so this bloody old man has 1 or more dog, AND...?');}",
        "isRootNode": false
    },
];
const Table_RuleChainRelationship = [
    {
        "RCRID":"rcr1",
        "RCID": "rc1",
        "RCNID_Start": "rcn1",
        "RCNID_End": "rcn2",
        "operation": "gte",
        "value": 18
    },
    {
        "RCRID":"rcr2",
        "RCID": "rc2",
        "RCNID_Start": "rcn3",
        "RCNID_End": "rcn4",
        "operation": "eq",
        "value": "'dog'"
    },
    {
        "RCRID":"rcr3",
        "RCID": "rc4",
        "RCNID_Start": "rcn5",
        "RCNID_End": "rcn6",
        "operation": "gte",
        "value": 60
    },
    {
        "RCRID":"rcr4",
        "RCID": "rc3",
        "RCNID_Start": "rcn7",
        "RCNID_End": "rcn8",
        "operation": "gt",
        "value": 1
    }
];

module.exports = 
{
    "RuleChainInputModel":Table_RuleChainInputModel,
    "RuleChain" : Table_RuleChain,
    "RuleChainNode": Table_RuleChainNode,
    "RuleChainRelationship": Table_RuleChainRelationship
};
