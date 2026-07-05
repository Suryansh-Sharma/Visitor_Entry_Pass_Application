package com.suryansh.visitorentry.service;

import com.suryansh.visitorentry.dto.TelegramIdDto;
import com.suryansh.visitorentry.dto.VisitorDto;
import com.suryansh.visitorentry.entity.TelegramIdDocument;
import com.suryansh.visitorentry.entity.VisitingRecordDoc;
import com.suryansh.visitorentry.entity.VisitorDoc;
import com.suryansh.visitorentry.model.AddNewVisitModel;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

@Service
public class MapperService {
    private final ModelMapper mapper;

    public MapperService(ModelMapper mapper) {
        this.mapper = mapper;
    }

    public VisitorDoc mapAddNewVisitModelToEntity(AddNewVisitModel model){
        return mapper.map(model, VisitorDoc.class);
    }


    public VisitorDto mapVisitEntityToDto(VisitorDoc visitDocument) {
        return mapper.map(visitDocument, VisitorDto.class);
    }

    public TelegramIdDto MapTelegramDocToDto(TelegramIdDocument document){
        return mapper.map(document, TelegramIdDto.class);
    }

    public VisitingRecordDoc  mapAddNewVisitVisitingRecordToEntity(AddNewVisitModel.VisitingRecord visitingRecord) {
        return mapper.map(visitingRecord, VisitingRecordDoc.class);
    }

    public VisitorDto visitorDocToEntity(VisitorDoc visitorDoc) {
        return mapper.map(visitorDoc, VisitorDto.class);
    }
}
