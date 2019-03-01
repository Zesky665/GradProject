defmodule Chat.Repo.Migrations.CreateCorners do
  use Ecto.Migration

  def change do
    create table(:corners) do
      add :corner_name, :string
      add :corner_type, :integer
      timestamps()
    end

  end
end
