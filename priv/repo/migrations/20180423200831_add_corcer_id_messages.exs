defmodule Chat.Repo.Migrations.AddCorcerIdMessages do
  use Ecto.Migration

   def change do
     alter table(:messages) do
      add :corner_id, :integer
      add :user_id, :integer
     end
   end
end
