defmodule Chat.ServerTest do
  use Chat.DataCase

  alias Chat.Server

  describe "rooms" do
    alias Chat.Server.Room

    @valid_attrs %{room_id: 42, room_name: "some room_name"}
    @update_attrs %{room_id: 43, room_name: "some updated room_name"}
    @invalid_attrs %{room_id: nil, room_name: nil}

    def room_fixture(attrs \\ %{}) do
      {:ok, room} =
        attrs
        |> Enum.into(@valid_attrs)
        |> Server.create_room()

      room
    end

    test "list_rooms/0 returns all rooms" do
      room = room_fixture()
      assert Server.list_rooms() == [room]
    end

    test "get_room!/1 returns the room with given id" do
      room = room_fixture()
      assert Server.get_room!(room.id) == room
    end

    test "create_room/1 with valid data creates a room" do
      assert {:ok, %Room{} = room} = Server.create_room(@valid_attrs)
      assert room.room_id == 42
      assert room.room_name == "some room_name"
    end

    test "create_room/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Server.create_room(@invalid_attrs)
    end

    test "update_room/2 with valid data updates the room" do
      room = room_fixture()
      assert {:ok, room} = Server.update_room(room, @update_attrs)
      assert %Room{} = room
      assert room.room_id == 43
      assert room.room_name == "some updated room_name"
    end

    test "update_room/2 with invalid data returns error changeset" do
      room = room_fixture()
      assert {:error, %Ecto.Changeset{}} = Server.update_room(room, @invalid_attrs)
      assert room == Server.get_room!(room.id)
    end

    test "delete_room/1 deletes the room" do
      room = room_fixture()
      assert {:ok, %Room{}} = Server.delete_room(room)
      assert_raise Ecto.NoResultsError, fn -> Server.get_room!(room.id) end
    end

    test "change_room/1 returns a room changeset" do
      room = room_fixture()
      assert %Ecto.Changeset{} = Server.change_room(room)
    end
  end

  describe "corners" do
    alias Chat.Server.Corner

    @valid_attrs %{corner_id: 42, corner_name: "some corner_name"}
    @update_attrs %{corner_id: 43, corner_name: "some updated corner_name"}
    @invalid_attrs %{corner_id: nil, corner_name: nil}

    def corner_fixture(attrs \\ %{}) do
      {:ok, corner} =
        attrs
        |> Enum.into(@valid_attrs)
        |> Server.create_corner()

      corner
    end

    test "list_corners/0 returns all corners" do
      corner = corner_fixture()
      assert Server.list_corners() == [corner]
    end

    test "get_corner!/1 returns the corner with given id" do
      corner = corner_fixture()
      assert Server.get_corner!(corner.id) == corner
    end

    test "create_corner/1 with valid data creates a corner" do
      assert {:ok, %Corner{} = corner} = Server.create_corner(@valid_attrs)
      assert corner.corner_id == 42
      assert corner.corner_name == "some corner_name"
    end

    test "create_corner/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Server.create_corner(@invalid_attrs)
    end

    test "update_corner/2 with valid data updates the corner" do
      corner = corner_fixture()
      assert {:ok, corner} = Server.update_corner(corner, @update_attrs)
      assert %Corner{} = corner
      assert corner.corner_id == 43
      assert corner.corner_name == "some updated corner_name"
    end

    test "update_corner/2 with invalid data returns error changeset" do
      corner = corner_fixture()
      assert {:error, %Ecto.Changeset{}} = Server.update_corner(corner, @invalid_attrs)
      assert corner == Server.get_corner!(corner.id)
    end

    test "delete_corner/1 deletes the corner" do
      corner = corner_fixture()
      assert {:ok, %Corner{}} = Server.delete_corner(corner)
      assert_raise Ecto.NoResultsError, fn -> Server.get_corner!(corner.id) end
    end

    test "change_corner/1 returns a corner changeset" do
      corner = corner_fixture()
      assert %Ecto.Changeset{} = Server.change_corner(corner)
    end
  end
end
