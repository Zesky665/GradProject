defmodule Chat.Repo.Migrations.AddUserIdToRooms do
  use Ecto.Migration

    def change do
      alter table(:rooms) do
        add :user_id, :integer
      end
    end
end
