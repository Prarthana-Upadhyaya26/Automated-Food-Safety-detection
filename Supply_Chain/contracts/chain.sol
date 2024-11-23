// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract chain {
    //Smart Contract owner will be the person who deploys the contract; only they can authorize various roles
    address public Owner;

    // Constructor will be called when smart contract is deployed on the blockchain
    constructor(){
        Owner = msg.sender;
    }

    //Roles (flow of supply chain)
    enum Role { 
        None, 
        RawMaterialSupplier, 
        Manufacturer, 
        Distributor, 
        Retailer 
    }
    
    // Enum representing different stages in the supply chain
    enum STAGE {
        Init,
        RawMaterialSupply,
        Manufacture,
        Distribution,
        Retail,
        Sold
    }
    
    // Cold Drink count
    uint256 public ColdDrinkCtr = 0;
    // Counters for suppliers, manufacturers, distributors, and retailers
    uint256 public rmsCtr = 0;
    uint256 public manCtr = 0;
    uint256 public disCtr = 0;
    uint256 public retCtr = 0;

    //Struct to track Cold Drink data
    struct ColdDrink {
        uint256 id;
        string name;
        string description;
        uint256 RMSid;
        uint256 MANid;
        uint256 DISid;
        uint256 RETid;
        STAGE stage;
        bool ingredientsPermitted;
    }

    // Mappings to store all Cold Drinks and participants in the supply chain
    mapping(uint256 => ColdDrink) public Stock;
    mapping(address => Role) public Participants;

    // Modifier to ensure only contract owner can call certain functions
    modifier onlyByOwner() {
        require(msg.sender == Owner, "Not authorized");
        _;
    }

    // Modifier to ensure only a specific role can access the function
    modifier onlyByRole(Role _role) {
        require(Participants[msg.sender] == _role, "Not authorized for this role");
        _;
    }

    // Function to add participants in the supply chain
    function addParticipant(address _address, Role _role) public onlyByOwner {
        Participants[_address] = _role;
        if (_role == Role.RawMaterialSupplier) rmsCtr++;
        else if (_role == Role.Manufacturer) manCtr++;
        else if (_role == Role.Distributor) disCtr++;
        else if (_role == Role.Retailer) retCtr++;
    }

    // Function to show the stage of the cold drink
    function showStage(uint256 _ID) public view returns (string memory) {
        require(_ID > 0 && _ID <= ColdDrinkCtr, "ColdDrink ID is invalid");

        if (Stock[_ID].stage == STAGE.Init)
            return "ColdDrink Ordered";
        else if (Stock[_ID].stage == STAGE.RawMaterialSupply)
            return "Raw Material Supply Stage";
        else if (Stock[_ID].stage == STAGE.Manufacture)
            return "Manufacturing Stage";
        else if (Stock[_ID].stage == STAGE.Distribution)
            return "Distribution Stage";
        else if (Stock[_ID].stage == STAGE.Retail)
            return "Retail Stage";
        else if (Stock[_ID].stage == STAGE.Sold)
            return "ColdDrink Sold";
        else
            return "Invalid Stage";
    }

    // Function to add new ColdDrinks to the stock
    function addColdDrink(string memory _name, string memory _description, bool _ingredientsPermitted) public onlyByOwner {
        ColdDrinkCtr++;
        Stock[ColdDrinkCtr] = ColdDrink(
            ColdDrinkCtr,
            _name,
            _description,
            0,
            0,
            0,
            0,
            STAGE.Init,
            _ingredientsPermitted
        );
    }

    // Function for raw material supply to the manufacturer
    function supplyRawMaterials(uint256 _ID) public onlyByRole(Role.RawMaterialSupplier) {
        require(Stock[_ID].stage == STAGE.Init, "Invalid stage for raw material supply");
        Stock[_ID].RMSid = rmsCtr;
        Stock[_ID].stage = STAGE.RawMaterialSupply;
    }

    // Function for manufacturing process
    function manufactureColdDrink(uint256 _ID) public onlyByRole(Role.Manufacturer) {
        require(Stock[_ID].stage == STAGE.RawMaterialSupply, "Invalid stage for manufacturing");
        Stock[_ID].MANid = manCtr;
        Stock[_ID].stage = STAGE.Manufacture;
    }

    // Function for distribution process
    function distributeColdDrink(uint256 _ID) public onlyByRole(Role.Distributor) {
        require(Stock[_ID].stage == STAGE.Manufacture, "Invalid stage for distribution");
        Stock[_ID].DISid = disCtr;
        Stock[_ID].stage = STAGE.Distribution;
    }

    // Function to retail the ColdDrink
    function retailColdDrink(uint256 _ID) public onlyByRole(Role.Retailer) {
        require(Stock[_ID].stage == STAGE.Distribution, "Invalid stage for retailing");
        Stock[_ID].RETid = retCtr;
        Stock[_ID].stage = STAGE.Retail;
    }

    // Function to mark ColdDrink as sold
    function sellColdDrink(uint256 _ID) public onlyByRole(Role.Retailer) {
        require(Stock[_ID].stage == STAGE.Retail, "Invalid stage for selling");
        Stock[_ID].stage = STAGE.Sold;
    }

    // Function to check if a particular address belongs to a participant role
    function checkRole(address _address) public view returns (string memory) {
        Role role = Participants[_address];
        if (role == Role.RawMaterialSupplier) return "Raw Material Supplier";
        else if (role == Role.Manufacturer) return "Manufacturer";
        else if (role == Role.Distributor) return "Distributor";
        else if (role == Role.Retailer) return "Retailer";
        else return "No Role Assigned";
    }
}
