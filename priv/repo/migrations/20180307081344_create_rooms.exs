defmodule Chat.Repo.Migrations.CreateRooms do
  use Ecto.Migration

  def change do
    create table(:rooms) do
      add :room_name, :string
      add :room_id, :integer
      
      timestamps()
    end

  end
end
