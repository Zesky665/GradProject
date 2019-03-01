defmodule Chat.Repo.Migrations.RemoveIdRoom do
  use Ecto.Migration

  def change do
    alter table(:rooms) do
     remove :room_id
    end
  end
end
