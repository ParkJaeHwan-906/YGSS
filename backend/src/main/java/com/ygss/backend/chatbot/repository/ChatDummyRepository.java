package com.ygss.backend.chatbot.repository;

import com.ygss.backend.chatbot.dto.ChatDummyResponseDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface ChatDummyRepository {
    @Select("SELECT id, term_id, question, answer FROM chat_dummy;")
    List<ChatDummyResponseDto> selectAllChatDummy();
}
