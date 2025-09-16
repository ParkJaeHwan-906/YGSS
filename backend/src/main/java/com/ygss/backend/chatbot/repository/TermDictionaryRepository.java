package com.ygss.backend.chatbot.repository;

import com.ygss.backend.chatbot.dto.TermDictionaryResponseDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface TermDictionaryRepository {
    @Select("SELECT id, term, `desc` FROM term_dictionary")
    List<TermDictionaryResponseDto> selectAllTerm();
}
