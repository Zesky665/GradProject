defmodule ChatWeb.WebrtcChannel do
    use ChatWeb, :channel
    require Logger

    alias ChatWeb.Presence
    alias Chat.Repo
    alias Chat.Auth.User
    alias ChatWeb.Socket

    def join("webrtc:" <> corner_id, %{"user_id" => user_id}, socket) do

      user_num = Kernel.map_size(Presence.list(socket))
      if(user_num < 4) do
      Logger.info "CHECK"
      #Logger.info user_id
      #IO.inspect Presence.list(socket)
       socket = assign(socket, :current_user_id, user_id)
       send(self(), :after_join) # this is where the pressence is kept
       {:ok, %{channel: "webrtc:#{user_id}"}, assign(socket, :user_id, user_id)}
      else
        Logger.info "REJECT"
        {:error, %{reason: "room is full"}}
      end
       
    end

    def handle_info(:after_join, socket) do
      #push socket, "presence_state", Presence.list(socket)

      user = Repo.get(User, socket.assigns[:current_user_id])
      user_num = Kernel.map_size(Presence.list(socket))
      
      Presence.track(socket, "user:#{user.id}", %{
        user_id: user.id,
        username: user.username,
        initiator: 1
      })

      updated = for {{user, val}, i} <- Enum.with_index(Presence.list(socket)) do
        meta =
          hd(val.metas)
          |> put_in([:initiator], i + 1)
      
        updated_val = put_in(val[:metas], [meta | tl(val.metas)])
        {user, updated_val}
      end
      
      updated_map = Enum.into(updated, %{})
      push socket, "presence_state", updated_map
      Logger.info "THIS IS A LONG LOUD LINE OF THEXT"
      IO.inspect Presence.list(socket)
      Logger.info "THIS IS A LONG LOUD LINE OF THEXT"
      IO.inspect updated_map
      {:noreply, socket}
    end

    def handle_in("update", %{"message" => message}, socket) do
      updated = for {{user, val}, i} <- Enum.with_index(Presence.list(socket)) do
        meta =
          hd(val.metas)
          |> put_in([:initiator], i + 1)
      
        updated_val = put_in(val[:metas], [meta | tl(val.metas)])
        {user, updated_val}
      end
      updated_map = Enum.into(updated, %{})
      #push socket, "presence_state", updated_map
      broadcast!(socket, "presence_state", updated_map)
      Logger.info "THIS WORKED"
      {:noreply, socket}
    end
  end