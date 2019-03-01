# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds.exs
#
# Inside the script, you can read and write to any of your
# repositories directly:
#
#    Chat.Repo.insert!(Chat.Message.changeset(%Chat.Message{}, {"message"=> "fgfgfdggfg","name" => "fdgdfgfdgdfgs"}))
#
# We recommend using the bang functions (`insert!`, `update!`
# and so on) as they will fail if something goes wrong.
Chat.Auth.register(%{
    "email" => "admin@mail.com",
    "password" => "secret",
    "password_confirmation" => "secret",
    "username" => "admin"
  })

Chat.Auth.register(%{
    "email" => "test@mail.com",
    "password" => "secret",
    "password_confirmation" => "secret",
    "username" => "test"
  })

Chat.Auth.register(%{
    "email" => "bob@mail.com",
    "password" => "secret",
    "password_confirmation" => "secret",
    "username" => "bob"
  })
user = Chat.Server.get_user!(1)
#Chat.Server.create_room(user,%{"name" => "Welcome", "room_public" => "true", "subscriptions" => "2, 3"})
#Chat.Server.create_corner()