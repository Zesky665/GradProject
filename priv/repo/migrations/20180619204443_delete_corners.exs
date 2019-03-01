defmodule Chat.Repo.Migrations.DeleteCorners do
  use Ecto.Migration

  def change do
    alter table(:corners) do
      remove :room_id
      add :room_id, references(:rooms, on_delete: :delete_all), null: false
  end
end
end
