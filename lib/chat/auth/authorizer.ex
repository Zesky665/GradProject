defmodule Chat.Auth.Authorizer do
    def can_manage?(user, room) do
      user.id == room.user_id
    end

    def can_enter?(user, room) do
      #IO.inspect user
      members = Enum.map(room.users, fn(x) -> x.id end)
      Enum.any?(members, fn(x) -> x == user.id end)
    end

    def text_feed?(code) do
      case code do
        3 ->
          true
        1 -> 
          true
        _ ->
          false
    end
  end
    def video_feed?(code) do
      case code do
        3 ->
          true
        2 -> 
          true
        _ ->
          false
    end
  end
end