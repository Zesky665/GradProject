defmodule Chat.Server.Corner do
  use Ecto.Schema
  import Ecto.Changeset
  alias Chat.Server.{Corner, Room}

  schema "corners" do
    field :corner_name, :string
    belongs_to :room, Room
    field :corner_type, :integer
    timestamps()
  end

  @doc false
  def changeset(corner, attrs) do
    corner
    |> cast(attrs, [:corner_name, :room_id, :corner_type])
    |> validate_required([:corner_name, :room_id, :corner_type])
  end
end
