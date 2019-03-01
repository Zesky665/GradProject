defmodule ChatWeb.CornerChannel do
    use ChatWeb, :channel
    require Logger

    alias ChatWeb.Presence
    alias Chat.Repo
    alias Chat.Auth.User

    def join("corner:" <> corner_id, %{"user_id" => user_id}, socket) do
      socket = assign(socket, :current_user_id, user_id)
      #IO.inspect socket
      #IO.inspect user_id
      send(self(), :after_join)
     
      {:ok, %{channel: "corner:#{corner_id}"}, assign(socket, :corner_id, corner_id)}
    end

    def handle_in("message:add", %{"message" => message, "name" => name, "user_id" => user_id}, socket) do
      corner_id = socket.assigns[:corner_id]
      #message = %{content: content, user: %{name: "Test"}}
      msg = %{name: name, message: message, corner_id: corner_id, user_id: user_id}
      spawn(fn -> save_msg(msg) end)

      broadcast!(socket, "corner:#{corner_id}:new_message", msg)
      {:noreply, socket}
    end

    def handle_in("start:call", %{"initiator" => initiator}, socket) do
      user = Repo.get(User, socket.assigns[:current_user_id])

      {:ok, _} = Presence.update(socket, "user:#{user.id}", %{
        user_id: user.id,
        username: user.username,
        initiator: initiator
      })

      {:reply, :ok, socket}
    end

    def handle_in("call:offer", %{"body" => body}, socket) do
      broadcast! socket , "call:offer", %{body: body}
      {:noreply, socket}
    end

    def handle_info(:after_join, socket) do
      #Chat.Repo.all(Chat.Message, limit: 3)
      #Ecto.Adapter.SQL.query(Chat.Repo, "SELECT * FROM Messages order by id desc limit $1",[10])
      #IO.inspect socket
      push socket, "presence_state", Presence.list(socket)

      user = Repo.get(User, socket.assigns[:current_user_id])

      {:ok, _} = Presence.track(socket, "user:#{user.id}", %{
        user_id: user.id,
        username: user.username,
        initiator: false
      })

      Logger.info "THIS IS A LONG LOUD LINE OF THEXT"
      Chat.Message.get_msg(socket.assigns[:corner_id])
      |> Enum.reverse
      |> Enum.each(fn msg -> broadcast!(socket, "corner:#{socket.assigns[:corner_id]}:new_message", %{name: msg.name, message: msg.message, id: msg.id, user_id: msg.user_id})end)
      {:noreply, socket}
    end

    defp save_msg(msg) do
     # Logger.info  "Logging this text!"
     # Logger.debug "Var value: #{inspect(msg)}"
     # IO.inspect msg
      Chat.Message.changeset(%Chat.Message{}, msg) |> Chat.Repo.insert  
    end
  end