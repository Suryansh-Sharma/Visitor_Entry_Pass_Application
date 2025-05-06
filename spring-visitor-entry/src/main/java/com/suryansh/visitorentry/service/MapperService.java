package com.suryansh.visitorentry.service;

import com.suryansh.visitorentry.dto.TelegramIdDto;
import com.suryansh.visitorentry.dto.VisitorDto;
import com.suryansh.visitorentry.entity.TelegramIdDocument;
import com.suryansh.visitorentry.entity.VisitingRecordDoc;
import com.suryansh.visitorentry.entity.VisitorDoc;
import com.suryansh.visitorentry.model.VisitModel;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class MapperService {
    private final ModelMapper mapper;

    public MapperService(ModelMapper mapper) {
        this.mapper = mapper;
    }

    public VisitorDoc mapVisitModelToDoc(VisitModel model){
        VisitorDoc document = mapper.map(model, VisitorDoc.class);
        VisitorDoc.BanStatus banStatus = null;
        if (model.getBanStatus() != null && model.getBanStatus().getIsVisitorBanned()) {
            banStatus= new  VisitorDoc.BanStatus(LocalDateTime.now(),model.getBanStatus().getIsVisitorBanned(),model.getBanStatus().getReason());
        }
        document.setBanStatus(banStatus);

        if (!model.getHasChildrenInSchool()){
            document.setHasChildrenInSchool(false);
            document.setVisitorChildren(null);
        }
        return document;
    }


    public VisitorDto mapVisitEntityToDto(VisitorDoc visitDocument) {
        return mapper.map(visitDocument, VisitorDto.class);
    }

    public TelegramIdDto MapTelegramDocToDto(TelegramIdDocument document){
        return mapper.map(document, TelegramIdDto.class);
    }

    public VisitingRecordDoc mapVisitingRecordModelToDoc(VisitModel.VisitingRecord visitingRecord) {
        return mapper.map(visitingRecord, VisitingRecordDoc.class);
    }
}
