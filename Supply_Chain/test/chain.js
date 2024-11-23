const Chain = artifacts.require("chain");

contract("Chain", accounts => {
  let chainInstance;
  const owner = accounts[0];
  const rms = accounts[1]; // Raw Material Supplier
  const manufacturer = accounts[2];
  const distributor = accounts[3];
  const retailer = accounts[4];

  beforeEach(async () => {
    chainInstance = await Chain.new(); // Deploy the contract
  });

  // Test 1: Verify contract owner
  it("should set the contract owner correctly", async () => {
    const contractOwner = await chainInstance.Owner();
    assert.equal(contractOwner, owner, "The contract owner is not set correctly");
  });

  // Test 2: Add a participant to the supply chain
  it("should add a participant to the supply chain", async () => {
    await chainInstance.addParticipant(rms, 1, { from: owner }); // 1 corresponds to RawMaterialSupplier
    const role = await chainInstance.checkRole(rms);
    assert.equal(role, "Raw Material Supplier", "Participant role is incorrect");
  });

  // Test 3: Add cold drink
  it("should add a new cold drink", async () => {
    await chainInstance.addColdDrink("Cola", "A refreshing soft drink", true, { from: owner });
    const coldDrink = await chainInstance.Stock(1); // Stock[1] will store the first cold drink
    assert.equal(coldDrink.name, "Cola", "Cold drink name is incorrect");
    assert.equal(coldDrink.description, "A refreshing soft drink", "Cold drink description is incorrect");
    assert.equal(coldDrink.ingredientsPermitted, true, "Cold drink ingredientsPermitted flag is incorrect");
  });

  // Test 4: Supply raw materials
  it("should allow raw material supplier to supply raw materials", async () => {
    await chainInstance.addParticipant(rms, 1, { from: owner });
    await chainInstance.addColdDrink("Cola", "A refreshing soft drink", true, { from: owner });
    await chainInstance.supplyRawMaterials(1, { from: rms });
    const coldDrink = await chainInstance.Stock(1);
    assert.equal(coldDrink.stage.toString(), "1", "Cold drink stage is not updated to RawMaterialSupply");
    assert.equal(coldDrink.RMSid.toString(), "1", "Raw Material Supplier ID is incorrect");
  });

  // Test 5: Manufacture cold drink
  it("should allow manufacturer to manufacture cold drink", async () => {
    await chainInstance.addParticipant(rms, 1, { from: owner });
    await chainInstance.addParticipant(manufacturer, 2, { from: owner });
    await chainInstance.addColdDrink("Cola", "A refreshing soft drink", true, { from: owner });
    await chainInstance.supplyRawMaterials(1, { from: rms });
    await chainInstance.manufactureColdDrink(1, { from: manufacturer });
    const coldDrink = await chainInstance.Stock(1);
    assert.equal(coldDrink.stage.toString(), "2", "Cold drink stage is not updated to Manufacture");
    assert.equal(coldDrink.MANid.toString(), "1", "Manufacturer ID is incorrect");
  });

  // Test 6: Distribute cold drink
  it("should allow distributor to distribute cold drink", async () => {
    await chainInstance.addParticipant(rms, 1, { from: owner });
    await chainInstance.addParticipant(manufacturer, 2, { from: owner });
    await chainInstance.addParticipant(distributor, 3, { from: owner });
    await chainInstance.addColdDrink("Cola", "A refreshing soft drink", true, { from: owner });
    await chainInstance.supplyRawMaterials(1, { from: rms });
    await chainInstance.manufactureColdDrink(1, { from: manufacturer });
    await chainInstance.distributeColdDrink(1, { from: distributor });
    const coldDrink = await chainInstance.Stock(1);
    assert.equal(coldDrink.stage.toString(), "3", "Cold drink stage is not updated to Distribution");
    assert.equal(coldDrink.DISid.toString(), "1", "Distributor ID is incorrect");
  });

  // Test 7: Retail cold drink
  it("should allow retailer to retail cold drink", async () => {
    await chainInstance.addParticipant(rms, 1, { from: owner });
    await chainInstance.addParticipant(manufacturer, 2, { from: owner });
    await chainInstance.addParticipant(distributor, 3, { from: owner });
    await chainInstance.addParticipant(retailer, 4, { from: owner });
    await chainInstance.addColdDrink("Cola", "A refreshing soft drink", true, { from: owner });
    await chainInstance.supplyRawMaterials(1, { from: rms });
    await chainInstance.manufactureColdDrink(1, { from: manufacturer });
    await chainInstance.distributeColdDrink(1, { from: distributor });
    await chainInstance.retailColdDrink(1, { from: retailer });
    const coldDrink = await chainInstance.Stock(1);
    assert.equal(coldDrink.stage.toString(), "4", "Cold drink stage is not updated to Retail");
    assert.equal(coldDrink.RETid.toString(), "1", "Retailer ID is incorrect");
  });

  // Test 8: Mark cold drink as sold
  it("should allow retailer to mark cold drink as sold", async () => {
    await chainInstance.addParticipant(rms, 1, { from: owner });
    await chainInstance.addParticipant(manufacturer, 2, { from: owner });
    await chainInstance.addParticipant(distributor, 3, { from: owner });
    await chainInstance.addParticipant(retailer, 4, { from: owner });
    await chainInstance.addColdDrink("Cola", "A refreshing soft drink", true, { from: owner });
    await chainInstance.supplyRawMaterials(1, { from: rms });
    await chainInstance.manufactureColdDrink(1, { from: manufacturer });
    await chainInstance.distributeColdDrink(1, { from: distributor });
    await chainInstance.retailColdDrink(1, { from: retailer });
    await chainInstance.sellColdDrink(1, { from: retailer });
    const coldDrink = await chainInstance.Stock(1);
    assert.equal(coldDrink.stage.toString(), "5", "Cold drink stage is not updated to Sold");
  });
});
