package com.suryansh.visitorentry.service;

import com.suryansh.visitorentry.dto.TelegramIdDto;
import com.suryansh.visitorentry.dto.VisitorDto;
import com.suryansh.visitorentry.entity.TelegramIdEntity;
import com.suryansh.visitorentry.entity.VisitingRecordEntity;
import com.suryansh.visitorentry.entity.VisitorsEntity;
import com.suryansh.visitorentry.model.AddNewVisitModel;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

@Service
public class MapperService {
    private final ModelMapper mapper;

    public MapperService(ModelMapper mapper) {
        this.mapper = mapper;
    }

    public VisitorsEntity mapAddNewVisitModelToEntity(AddNewVisitModel model) {
        return mapper.map(model, VisitorsEntity.class);
    }


    public VisitorDto mapVisitEntityToDto(VisitorsEntity visitDocument) {
        return mapper.map(visitDocument, VisitorDto.class);
    }

    public TelegramIdDto MapTelegramDocToDto(TelegramIdEntity document) {
        return mapper.map(document, TelegramIdDto.class);
    }

    public VisitingRecordEntity mapAddNewVisitVisitingRecordToEntity(AddNewVisitModel.VisitingRecord visitingRecord) {
        return mapper.map(visitingRecord, VisitingRecordEntity.class);
    }

    public VisitorDto visitorDocToEntity(VisitorsEntity visitorDoc) {
        return mapper.map(visitorDoc, VisitorDto.class);
    }
}
