defmodule Chat.Repo.Migrations.CreateSubscriptions do
  use Ecto.Migration

  def change do
    create table(:subscriptions) do
      add :user_id, references(:users, on_delete: :nothing)
      add :room_id, references(:rooms, on_delete: :nothing)

      timestamps()
    end

    create index(:subscriptions, [:user_id])
    create index(:subscriptions, [:room_id])
    create unique_index(:subscriptions, [:user_id, :room_id])
  end
end
