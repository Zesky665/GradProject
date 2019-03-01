defmodule Chat.Server.Room do
  use Ecto.Schema
  import Ecto.Changeset
  alias Chat.Server.{Room, Corner}
  alias Chat.Auth.User

  schema "rooms" do
    #field :room_id, :integer
    field :room_name, :string
    field :room_public, :boolean
    field :user_id, :integer
    has_many :corners, Corner, on_delete: :delete_all
    many_to_many(:users, User, join_through: "subscriptions", on_delete: :delete_all )
    timestamps()
  end

  @doc false
  def changeset(room, attrs) do
    room
    |> cast(attrs, [:room_name, :room_public, :user_id])
    |> validate_required([:room_name, :room_public])
  end
end
