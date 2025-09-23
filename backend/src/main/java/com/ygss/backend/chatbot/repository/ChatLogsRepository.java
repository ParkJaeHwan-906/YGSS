package com.ygss.backend.chatbot.repository;

import com.ygss.backend.chatbot.dto.ChatLogDto;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface ChatLogsRepository {
    @Select("""
            SELECT cl.question, cl.answer FROM chat_logs cl
            WHERE cl.sid LIKE #{sid}
            ORDER BY cl.created_at DESC
            LIMIT 10;
            """)
    List<ChatLogDto> selectLatestQnABySid(String sid);

    @Insert("""
            INSERT INTO chat_logs(`sid`, `question`, `answer`) VALUES
            (#{sid}, #{question}, #{answer});
            """)
    Integer insertChatLog(String sid, String question, String answer);

    @Select("""
            SELECT COUNT(*) FROM chat_logs WHERE sid LIKE #{sid};
            """)
    Integer selectCntBySid(String sid);
}
