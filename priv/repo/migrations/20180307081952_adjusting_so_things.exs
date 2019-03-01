defmodule Chat.Repo.Migrations.AdjustingSoThings do
  use Ecto.Migration

  def change do
    alter table(:corners) do
      add :room_id, references(:rooms, on_delete: :delete_all), null: false
    end
  

  create index(:corners, [:room_id])
  end
end
