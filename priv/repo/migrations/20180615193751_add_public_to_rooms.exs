defmodule Chat.Repo.Migrations.AddPublicToRooms do
  use Ecto.Migration

  def change do
    alter table(:rooms) do
      add :room_public, :boolean
    end
  end
end
