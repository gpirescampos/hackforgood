pragma solidity ^0.4.11;

contract RefID {
    struct Person {
        bytes32 bioHash;
        bytes32 personalDataHash;
        address addr;
    }
    mapping (string => Person) persons;
    function getPerson(string _token) constant returns (bytes32, bytes32, address) {
        return (persons[_token].bioHash, persons[_token].personalDataHash, persons[_token].addr);
    }
    function updatePerson(string _token, bytes32 _personalDataHash, bytes32 _bioHash, address _addr) {
        persons[_token].personalDataHash = _personalDataHash;
        persons[_token].bioHash = _bioHash;
        persons[_token].addr = _addr;
    }
}