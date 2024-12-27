import { CreateUser } from "@/lib/actions/user.actions"; // Adjust the import path as necessary
import User from "@/lib/database/models/user.model"; // Adjust the import path as necessary
import { connectDB } from "@/lib/database/mongoose"; // Adjust the import path as necessary

jest.mock("@/lib/database/models/user.model");


describe("CreateUser function", () => {
  beforeAll(async () => {
    await connectDB(); // Mock DB connection
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create a new user", async () => {
    const mockUser = {
      clerkId: "12345",
      email: "dummyemail@example.com",
      username: "dummyuser",
      photo: "https://example.com/photo.jpg",
      firstName: "John",
      lastName: "Doe",
      planId: 1,
      creditBalance: 10,
    };

    // Use the provided syntax to mock User.create
    const createUserMock = jest.fn().mockResolvedValue(mockUser);
    (User.create as jest.Mock).mockImplementation(createUserMock);

    const result = await CreateUser(mockUser);

    expect(result).toEqual(mockUser);
    expect(createUserMock).toHaveBeenCalledWith(mockUser);
  });

  it("should handle errors", async () => {
    const mockUser = {
      clerkId: "12345",
      email: "dummyemail@example.com",
      username: "dummyuser",
      photo: "https://example.com/photo.jpg",
      firstName: "John",
      lastName: "Doe",
      planId: 1,
      creditBalance: 10,
    };

    const createUserMock = jest.fn().mockRejectedValue(new Error("Create user failed"));
    (User.create as jest.Mock).mockImplementation(createUserMock);

    await expect(CreateUser(mockUser)).rejects.toThrow("Create user failed");
    expect(createUserMock).toHaveBeenCalledWith(mockUser);
  });
});
