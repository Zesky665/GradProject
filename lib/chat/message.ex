defmodule Chat.Message do
  use Ecto.Schema
  import Ecto.{Changeset, Query}
  alias Chat.Message

  schema "messages" do
    field :message, :string
    field :name, :string
    field :corner_id, :integer
    field :user_id, :integer

    timestamps()
  end

  @doc false
  def changeset(message, attrs) do
    message
    |> cast(attrs, [:name, :message,  :corner_id, :user_id])
    |> validate_required([:name, :message,  :corner_id, :user_id])
  end

  def get_msg(corner_id) do
    Message 
    |> where([u], u.corner_id == ^corner_id)
    |> limit(10)
    |> order_by(desc: :inserted_at)
    |> Chat.Repo.all()  
  end
end
