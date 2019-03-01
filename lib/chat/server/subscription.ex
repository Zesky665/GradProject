defmodule Chat.Server.Subscription do
  use Ecto.Schema
  import Ecto.Changeset
  alias Chat.Server.{Room, Subscription}
  alias Chat.Auth.User


  schema "subscriptions" do
    belongs_to(:user, User)
    belongs_to(:room, Room)

    timestamps()
  end

  @doc false
  def changeset(subscription, attrs) do
    subscription
    |> cast(attrs, [:user_id, :room_id])
    |> foreign_key_constraint(:user_id)
    |> validate_required([:user_id, :room_id])
  end
end
