pragma solidity ^0.4.11;

contract owned {
    address owner;

    modifier isOwned() {
        if (msg.sender == owner) {
            _;
        }
    }
    function owned() {
        owner = msg.sender;
    }
    function modifyOwner() isOwned {
        owner = msg.sender;
    }
}
contract mortal is owned {
    function kill() isOwned {
        selfdestruct(owner);
    }
}
contract RefID is owned, mortal {
    
    struct Location {
        string lat;
        string long;
        uint dateAdded;
    }

    struct Person {
        bytes32 bioHash;
        bytes32 personalDataHash;
        uint dateUpdated;
        uint dateCreated;
        address addr;
        Location[] locations;
    }
    
    Person person;
    
    function RefID(string _lat, string _long, string, bytes32 _bioHash, bytes32 _personalDataHash) {
        owner = msg.sender;
        person.addr = msg.sender;
        person.dateUpdated = now;
        person.dateCreated = now;
        person.locations.push(Location(_lat, _long, now));
        person.bioHash = _bioHash;
        person.personalDataHash = _personalDataHash;
    }
    
    function getPerson() constant returns (bytes32, bytes32, address, uint, uint) {
        return (person.bioHash, person.personalDataHash, person.addr, person.dateUpdated, person.dateCreated);
    }
    
    function updateLocation(string _lat, string _long) {
        person.locations.push(Location(_lat, _long, now));
        person.dateUpdated = now;
    }
}