const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("UserRegistration", function () {
  let userRegistration;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const UserRegistration = await ethers.getContractFactory("UserRegistration");
    userRegistration = await UserRegistration.deploy();
  });

  describe("Register User", function () {
    it("Should allow a new user to register", async function () {
      await userRegistration.connect(addr1).registerUser("Alice");
      expect(await userRegistration.isRegisteredByAddress(addr1.address)).to.equal(true);
    });
  
    it("Should not allow the same user to register twice", async function () {
      await userRegistration.connect(addr1).registerUser("Alice");
      await expect(userRegistration.connect(addr1).registerUser("Alice")).to.be.revertedWith("User already registered.");
    });
  });

  
  describe("Check Registration", function () {
    it("Should return true for a registered user's address", async function () {
      await userRegistration.connect(addr1).registerUser("Bob");
      expect(await userRegistration.isRegisteredByAddress(addr1.address)).to.equal(true);
    });
  
    it("Should return false for a non-registered user's address", async function () {
      expect(await userRegistration.isRegisteredByAddress(addr2.address)).to.equal(false);
    });
  
    it("Should return true if the caller is registered", async function () {
      await userRegistration.connect(addr1).registerUser("Charlie");
      expect(await userRegistration.connect(addr1).isRegistered()).to.equal(true);
    });
  });

  describe("Get User By Name", function () {
    it("Should return the correct address for a registered name", async function () {
      await userRegistration.connect(addr1).registerUser("Dave");
      const userAddress = await userRegistration.getUserByName("Dave");
      expect(userAddress).to.equal(addr1.address);
    });
  

  });
  
});
