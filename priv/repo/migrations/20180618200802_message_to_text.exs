defmodule Chat.Repo.Migrations.MessageToText do
  use Ecto.Migration

  def change do
    alter table(:messages) do
     remove :message
     add :message, :text
    end
  end
end
