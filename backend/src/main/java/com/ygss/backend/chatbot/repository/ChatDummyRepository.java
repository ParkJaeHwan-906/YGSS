package com.ygss.backend.chatbot.repository;

import com.ygss.backend.chatbot.dto.AnswerDto;
import com.ygss.backend.chatbot.dto.ChatDummyResponseDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Optional;

@Mapper
public interface ChatDummyRepository {
    @Select("SELECT id, term_id, question, answer FROM chat_dummy;")
    List<ChatDummyResponseDto> selectAllChatDummy();

    @Select("""
            SELECT term_id, answer FROM chat_dummy
            WHERE id = #{id};
            """)
    Optional<AnswerDto> selectAnswerById(Long id);
}
