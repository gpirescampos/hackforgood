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

    struct Person {
        string bioHash;
        string personalDataHash;
        uint dateUpdated;
        uint dateCreated;
    }
    
    Person person;
    
    function RefID(string _bioHash, string _personalDataHash) {
        person.dateUpdated = now;
        person.dateCreated = now;
        person.bioHash = _bioHash;
        person.personalDataHash = _personalDataHash;
    }
    
    function getPerson() constant returns (string, string, address, uint, uint) {
        return (person.bioHash, person.personalDataHash, owned.owner, person.dateUpdated, person.dateCreated);
    }
    
    function updatePerson(string _personalDataHash) {
        person.personalDataHash = _personalDataHash;
        person.dateUpdated = now;
    }
}