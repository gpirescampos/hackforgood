pragma solidity ^0.4.11;

contract RefID {
    struct Person {
        string bioHash;
        string personalDataHash;
        address addr;
    }
    mapping (string => Person) persons;
    function getPerson(string _token) constant returns (string, string, address) {
        return (persons[_token].bioHash, persons[_token].personalDataHash, persons[_token].addr);
    }
    function updatePerson(string _token, string _personalDataHash, string _bioHash, address _addr) {
        persons[_token].personalDataHash = _personalDataHash;
        persons[_token].bioHash = _bioHash;
        persons[_token].addr = _addr;
    }
}