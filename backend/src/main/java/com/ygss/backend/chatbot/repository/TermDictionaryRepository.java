package com.ygss.backend.chatbot.repository;

import com.ygss.backend.chatbot.dto.TermDictionaryResponseDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Optional;

@Mapper
public interface TermDictionaryRepository {
    @Select("SELECT id, term, `desc` FROM term_dictionary")
    List<TermDictionaryResponseDto> selectAllTerm();

    @Select("SELEC term FROM term_dictionary WHERE id = #{id}")
    Optional<String> getWord(Long id);
}
